import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { ProductsModule } from './products/product.module';
import { InventoryModule } from './inventory/inventory.module';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ProductsModule,
    InventoryModule,


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
