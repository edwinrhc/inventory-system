// src/inventory/transactions.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule }      from '@nestjs/typeorm';
import { Transaction }        from './entities/transaction.entity';
import { TransactionsController } from './transactions.controller';
import { InventoryModule }    from './inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    // Importa InventoryModule con forwardRef para inyectar InventoryService
    forwardRef(() => InventoryModule),
  ],
  controllers: [TransactionsController],
  // no providers propios: reusar InventoryService de InventoryModule
})
export class TransactionsModule {}
