import { Module } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { ProductTypesController } from './product-types.controller';
import { ProductType } from './entities/product-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [
    TypeOrmModule.forFeature([ProductType]),
  ],
  providers: [
    ProductTypesService],
  controllers: [ProductTypesController],
  exports: [ProductTypesService]
})
export class ProductTypesModule {}
