import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { InventoryDocument } from '../inventory/entities/inventory-document.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryLine } from '../inventory/entities/inventory-line.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports:[TypeOrmModule.forFeature([InventoryDocument,InventoryLine,Product])],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
