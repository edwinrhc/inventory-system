// src/inventory/inventory-docs.service.ts
import {
  BadRequestException, HttpException,
  Injectable,
  InternalServerErrorException,
  Logger, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryDocument } from './entities/inventory-document.entity';
import { InventoryLine } from './entities/inventory-line.entity';
import { InventoryItem } from './entities/inventory.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateInventoryDocumentDto } from './dto/create-inventory-document.dto';
import { PageDto } from '../common/dto/page.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { SequenceService } from './sequence.service';
import { CreateInventoryResult } from './dto/create-inventory-result.dto';

@Injectable()
export class InventoryDocsService {
  private readonly logger = new Logger(InventoryDocsService.name);

  constructor(
    @InjectRepository(InventoryDocument)
    private readonly docRepo: Repository<InventoryDocument>,
    @InjectRepository(InventoryLine)
    private readonly lineRepo: Repository<InventoryLine>,
    @InjectRepository(InventoryItem)
    private readonly itemRepo: Repository<InventoryItem>,
    private readonly dataSource: DataSource,
    private readonly seqSvc: SequenceService,
  ) {}



  async createDocument(
    dto: CreateInventoryDocumentDto,
    userId: string,
  ): Promise<{document: InventoryDocument; warnings: string[]}>{
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try{
      // 1) Construir manualmente la entidad de documento
      const reference = await this.seqSvc.next(dto.type);
      const doc = new InventoryDocument();

      doc.type      = dto.type;
      doc.reference = reference;
      // doc.reference = dto.reference;
      doc.date      = new Date(dto.date);
      doc.notes     = dto.notes;
      doc.userId    = userId;                        // ← ¡asignación explícita!

      // 2) Construir manualmente cada línea y asignar al documento
      doc.lines = dto.lines.map(lineDto => {
        const line = new InventoryLine();
        line.productId = lineDto.productId;
        line.quantity  = lineDto.quantity;
        line.unitPrice = lineDto.unitPrice;
        line.detail    = lineDto.detail;
        return line;
      });

      // 3) Guardar el documento con cascade de líneas
      const savedDoc = await runner.manager.save(doc);

      // === Validar stock para todas las líneas de salida ===
      if(dto.type === 'OUT'){
        for(const line of savedDoc.lines){
          const item = await runner.manager.findOne(InventoryItem,{
            where: { productId: line.productId}
          });
          if(!item){
            throw new NotFoundException(`No hay registro de inventario para el producto ${line.productId}`);
          }
          if(line.quantity > item.quantity){
            throw new BadRequestException(
              `Stock insuficiente para producto ` +
              `Solicitado: ${line.quantity}, disponible: ${item.quantity}`
            );
          }
        }
      }
      for (const line of savedDoc.lines){
        const delta = dto.type === 'IN'
          ? line.quantity :
          -line.quantity;
        await runner.manager
          .createQueryBuilder(InventoryItem, 'item')
          .update()
          .set({ quantity: () => `quantity + ${delta}` })
          .where('productId = :pid', { pid: line.productId })
          .execute();
      }
      // === Commit final ===
      await runner.commitTransaction();
      return { document: savedDoc, warnings: [] };

    }catch (error) {
      await runner.rollbackTransaction();
      this.logger.error('Error en createDocument', error.stack);
      // Si ya es una excepción HTTP (BadRequest, NotFound...), relánzala
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'No se pudo crear documento de inventario',
      );
    } finally {
      await runner.release();
    }

  }

  async findAll(pageOptions: PageOptionsDto): Promise<PageDto<InventoryDocument>>{
    const { page, limit, filter} = pageOptions;

    const qb = this.docRepo.createQueryBuilder('doc')
      .orderBy('doc.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if(filter?.trim()){
      qb.where('LOWER(doc.reference) LIKE LOWER(:filter)', { filter: `%${filter}%` });
    }

    const [items, totalItems] = await qb.getManyAndCount();

    return new PageDto<InventoryDocument>(items, totalItems, { page, limit });

  }

  async getNextReference(type: 'IN' | 'OUT'): Promise<string> {
    return this.seqSvc.next(type);
  }

  async peekNextReference(type: 'IN'|'OUT'): Promise<string> {
    return this.seqSvc.peek(type);
  }

}
