import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductType } from '../product-types/entities/product-type.entity';


@Module({

  imports: [TypeOrmModule.forFeature([Product,ProductType])],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService]
})

export class ProductsModule {}
