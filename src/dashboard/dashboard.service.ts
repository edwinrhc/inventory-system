import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryDocument } from '../inventory/entities/inventory-document.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DashboardService {

  constructor(
    @InjectRepository(InventoryDocument)
    private readonly docsRepo: Repository<InventoryDocument>
  ) {}

  // Total de documentos IN y OUT
  async getDocCounts(): Promise<{in:number, out:number}>{
    const inCount = await this.docsRepo.count({where: {type: 'IN'}});
    const outCount = await this.docsRepo.count({where: {type: 'OUT'}});
    return {in: inCount, out: outCount};
  }

  // Stock total agregado vs retirado
  async getStockSummary(): Promise<{added: number; removed: number}>{
    const [{ sum: added = 0 }] = await this.docsRepo
      .createQueryBuilder('d')
      .select('SUM(line.quantity)','sum')
      .innerJoin('d.lines','line')
      .where('d.type = :type', {type: 'IN'})
      .getRawMany();

    const [{sum: removed = 0}] = await this.docsRepo
      .createQueryBuilder('d')
      .select('SUM(line.quantity)','sum')
      .innerJoin('d.lines','line')
      .where('d.type = :type', {type: 'OUT'})
      .getRawMany();

    return {added, removed};
  }


  // Bajo Stock
  async getLowStockItems(
    threshold = 10,
  ): Promise<{ productId: string; name: string; currentStock: number }[]> {
    const items = await this.docsRepo
      .createQueryBuilder('d')
      .innerJoin('d.lines', 'line')           // Une con inventory_lines
      .innerJoin('line.product', 'product')   // Une con products
      .select('product.id', 'productId')      // Toma el id del producto
      .addSelect('product.name', 'name')      // Toma el nombre desde Product
      .addSelect(
        `SUM(
         CASE 
           WHEN d.type = 'IN' THEN line.quantity 
           ELSE -line.quantity 
         END
       )`,
        'currentStock',
      )
      .groupBy('product.id')
      .addGroupBy('product.name')
      .having(
        `SUM(
         CASE 
           WHEN d.type = :inType THEN line.quantity 
           ELSE -line.quantity 
         END
       ) <= :threshold`,
        { inType: 'IN', threshold },
      )
      .getRawMany();

    return items.map(i => ({
      productId: i.productId,
      name: i.name,
      currentStock: +i.currentStock,
    }));
  }


  async getMonthlyMovements(
    year: number,
  ): Promise<{ month: number; added: number; removed: number }[]> {
    const raws = await this.docsRepo
      .createQueryBuilder('d')
      .innerJoin('d.lines', 'line')  // OBLIGATORIO para usar line.quantity
      .select('EXTRACT(MONTH FROM d.createdAt)', 'month')
      .addSelect(
        `SUM(CASE WHEN d.type = 'IN' THEN line.quantity ELSE 0 END)`,
        'added',
      )
      .addSelect(
        `SUM(CASE WHEN d.type = 'OUT' THEN line.quantity ELSE 0 END)`,
        'removed',
      )
      .where('EXTRACT(YEAR FROM d.createdAt) = :year', { year })
      .groupBy('month')
      .orderBy('month')
      .getRawMany();

    return raws.map(r => ({
      month: +r.month,
      added: +r.added,
      removed: +r.removed,
    }));
  }


  async getTopMovingItems(
    limit = 5,
  ): Promise<{ productId: string; name: string; totalMoved: number }[]> {
    const raws = await this.docsRepo
      .createQueryBuilder('d')
      .innerJoin('d.lines', 'line')           // Une con inventory_lines
      .innerJoin('line.product', 'product')   // Une con products para obtener product.name
      .select('product.id', 'productId')
      .addSelect('product.name', 'name')      // <-- antes era line.name
      .addSelect('SUM(line.quantity)', 'totalMoved')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('totalMoved', 'DESC')
      .limit(limit)
      .getRawMany();

    return raws.map(r => ({
      productId: r.productId,
      name: r.name,
      totalMoved: +r.totalMoved,
    }));
  }


}
