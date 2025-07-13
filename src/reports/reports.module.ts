import { Module } from '@nestjs/common';
import { StockReportService } from './stock-report.service';
import { StockReportController } from './stock-report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { InventoryLine } from 'src/inventory/entities/inventory-line.entity';
import { InventoryDocument } from '../inventory/entities/inventory-document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, InventoryLine, InventoryDocument])],
  providers: [StockReportService],
  controllers: [StockReportController]
})
export class ReportsModule {}
