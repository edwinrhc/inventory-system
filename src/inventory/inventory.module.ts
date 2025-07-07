import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem,Product])],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService]
})


export class InventoryModule {}
