import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Product } from '../products/entities/product.entity';
import { TransactionsModule } from './transactions.module';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryItem, Product,Transaction]),
    // Importa TransactionsModule con forwardRef
    forwardRef(() => TransactionsModule),
  ],
  providers: [InventoryService],
  controllers: [InventoryController, TransactionsController],
  exports: [InventoryService],  // exporta para que TransactionsModule lo inyecte
})
export class InventoryModule {}
