import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Product } from '../products/entities/product.entity';
import { TransactionsModule } from './transactions.module';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { InventoryDocument } from './entities/inventory-document.entity';
import { InventoryLine } from './entities/inventory-line.entity';
import { InventoryDocsService } from './inventory-docs.service';
import { InventoryDocsController } from './inventory-docs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryItem,
      InventoryDocument,
      InventoryLine,
      Product,
      Transaction]),
    // Importa TransactionsModule con forwardRef
    forwardRef(() => TransactionsModule),
  ],
  providers: [
    InventoryService,
    InventoryDocsService],
  controllers: [
    InventoryController,
    InventoryDocsController,
    TransactionsController],

  exports: [InventoryService],  // exporta para que TransactionsModule lo inyecte
})
export class InventoryModule {}
