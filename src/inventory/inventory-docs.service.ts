import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryDocument } from './entities/inventory-document.entity';
import { DataSource, Repository } from 'typeorm';
import { InventoryLine } from './entities/inventory-line.entity';
import { InventoryItem } from './entities/inventory.entity';
import { CreateInventoryDocumentDto } from './dto/create-inventory-document.dto';

@Injectable()
export class InventoryDocsService {


  constructor(
    @InjectRepository(InventoryDocument)
    private docRepo: Repository<InventoryDocument>,
    @InjectRepository(InventoryLine)
    private lineRepo: Repository<InventoryLine>,
    @InjectRepository(InventoryItem)
    private itemRepo: Repository<InventoryItem>,
    private dataSource: DataSource
  ) {}

  async createDocument(
    dto: CreateInventoryDocumentDto,
    userId: string,
  ): Promise<InventoryDocument>{

    // Creamos documento con líneas (cascade)
    const doc = this.docRepo.create({
      ...dto,
      date: new Date(dto.date),
      userId
    });

    const savedDoc = await this.docRepo.save(doc);

    // Ajustamos stock línea
    for(const line of savedDoc.lines){
      const delta = dto.type === 'IN' ? line.quantity : -line.quantity;
      await this.itemRepo
        .createQueryBuilder()
        .update()
        .set({quantity: () => `quantity + ${delta}`})
        .where('productId = :pid', { pid: line.productId })
        .execute()
    }

    return savedDoc;
  }



}
