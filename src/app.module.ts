import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { ProductsModule } from './products/product.module';
import { InventoryModule } from './inventory/inventory.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TransactionsModule } from './inventory/transactions.module';
import { ProductTypesModule } from './product-types/product-types.module';
import { ReportsModule } from './reports/reports.module';
import { InventoryItemsModule } from './inventory-items/inventory-items.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    ProductsModule,
    InventoryModule,
    TransactionsModule,
    UsersModule,
    AuthModule,
    ProductTypesModule,
    ReportsModule,
    InventoryItemsModule,


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
