import { Module } from '@nestjs/common';
import { InventoryItemsService } from './inventory-items.service';
import { InventoryItemsController } from './inventory-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from '../inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem])],
  providers: [InventoryItemsService],
  controllers: [InventoryItemsController]
})
export class InventoryItemsModule {}
