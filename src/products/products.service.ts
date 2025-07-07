import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.repo.create(dto);
    return this.repo.save(product);
  }

  findAll(): Promise<Product[]>{
    return this.repo.find();
  }

  async findOne(id: string): Promise<Product>{
    const product = await this.repo.findOne({where: {id}});
    if(!product) throw new NotFoundException(`Producto ${id} no existe`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.repo.save(product);
  }

  async remove(id: string): Promise<void>{
    const result = await this.repo.delete(id);
    if(result.affected === 0){
      throw new NotFoundException(`Producto ${id} no existe`);
    }

  }





}
