import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryLine } from '../inventory/entities/inventory-line.entity';
import { InventoryDocument } from '../inventory/entities/inventory-document.entity';
import { StockReportDto } from './dto/stock-report.dto';
import { PageDto } from '../common/dto/page.dto';
import { PageOptionsDto } from '../common/dto/page-options.dto';

@Injectable()
export class StockReportService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(InventoryLine)
    private readonly lineRepo: Repository<InventoryLine>,
    @InjectRepository(InventoryDocument)
    private readonly docRepo: Repository<InventoryDocument>,
  ) {}

  // TODO: SIN PAGINAR
  async getStockReport(): Promise<StockReportDto[]> {
    const products = await this.productRepo.find();
    const report: StockReportDto[] = [];
    for (const product of products) {
      const lines = await this.lineRepo.find({
        where: { productId: product.id },
        relations: ['document'],
      });

      const totalIn = lines
        .filter((l) => l.document.type === 'IN')
        .reduce((sum, l) => sum + l.quantity, 0);

      const totalOut = lines
        .filter((l) => l.document.type === 'OUT')
        .reduce((sum, l) => sum + l.quantity, 0);

      const lastIn = lines
        .filter((l) => l.document.type === 'IN')
        .sort(
          (a, b) => b.document.date.getTime() - a.document.date.getTime(),
        )[0];

      const lastOut = lines
        .filter((l) => l.document.type === 'OUT')
        .sort(
          (a, b) => b.document.date.getTime() - a.document.date.getTime(),
        )[0];

      const stock = totalIn - totalOut;

      report.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        isActive: product.isActive,
        totalIn,
        totalOut,
        currentStock: stock,
        lastInRef: lastIn?.document.reference,
        lastOutRef: lastOut?.document.reference,
        lastInPrice: lastIn?.unitPrice ?? null,
        lastOutPrice: lastOut?.unitPrice ?? null,
      });
    }
    return report;
  }

  async getStockReportPaginated(pageOptions: PageOptionsDto): Promise<PageDto<StockReportDto>>{
    const { page, limit, filter } = pageOptions;

    // 1. crear el query paginado de productos
    const qb =  this.productRepo.createQueryBuilder('product')
      .where('LOWER(product.name) LIKE LOWER(:filter)', { filter: `%${filter}%` })
      .orderBy('product.name', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [products, total] = await qb.getManyAndCount();

    // 2. Armar el reporte con los productos paginados
    const report: StockReportDto[] = [];

    for(const product of products){
      const lines = await this.lineRepo.find({
        where: { productId: product.id},
        relations: ['document'],
      });

      const totalIn = lines
        .filter((l) => l.document.type === 'IN')
        .reduce((sum,l) => sum + l.quantity, 0);

      const totalOut = lines
        .filter((l) => l.document.type === 'OUT')
        .reduce((sum,l) => sum + l.quantity, 0);

      const lastIn = lines
        .filter((l) => l.document.type === 'IN')
        .sort((a,b) => b.document.date.getTime() - a.document.date.getTime())[0];

      const lastOut = lines
        .filter((l) => l.document.type === 'OUT')
        .sort((a,b) => b.document.date.getTime() - a.document.date.getTime())[0];

      const stock = totalIn - totalOut;

      report.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        isActive: product.isActive,
        totalIn,
        totalOut,
        currentStock: stock,
        lastInRef: lastIn?.document.reference,
        lastOutRef: lastOut?.document.reference,
        lastInPrice: lastIn?.unitPrice ?? null,
        lastOutPrice: lastOut?.unitPrice ?? null,
      });

    }
    return new PageDto<StockReportDto>(report, total, { page, limit });

  }



}
