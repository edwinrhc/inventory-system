import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductType } from './product-type.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';

@Injectable()
export class ProductTypesService {

  constructor(
    @InjectRepository(ProductType)
    private readonly repo: Repository<ProductType>
  ) { }

  async create(dto: CreateProductTypeDto): Promise<ProductType> {
    const productType = this.repo.create(dto);
    return this.repo.save(productType);
  }

  findAll(): Promise<ProductType[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<ProductType>{
    const productType = await this.repo.findOne({where: {id}});
    if(!productType) throw new NotFoundException(`Tipo de producto ${id} no existe`);
    return productType;
  }


  async update(id: string, dto: UpdateProductTypeDto): Promise<ProductType> {
    const productType = await this.findOne(id);
    Object.assign(productType, dto);
    return this.repo.save(productType);
  }

  async remove(id: string): Promise<void>{
    const result = await this.repo.delete(id);
    if(result.affected === 0){
      throw new NotFoundException(`Tipo de producto ${id} no existe`);
    }
  }


}
