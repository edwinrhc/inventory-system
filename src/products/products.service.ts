import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PageOptionsDto } from '../common/dto/page-options.dto';
import { PageDto } from '../common/dto/page.dto';
import { ProductType } from '../product-types/entities/product-type.entity';

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,

    @InjectRepository(ProductType)
    private readonly typeRepo: Repository<ProductType>
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {

    // 1) Aseguramos que exista el tipo
    const type = await this.typeRepo.findOneBy({id: dto.productTypeId});
    if(!type){
      throw new NotFoundException(`Tipo de producto ${dto.productTypeId} no existe`);
    }

    // 2) Creamos la entidad y le asignamos la relación
    const prod = this.repo.create({
      sku: dto.sku,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      productType: type,      // ← relación
    });
    return this.repo.save(prod);
  }

  // findAll(): Promise<Product[]>{
  //   return this.repo.find();
  // }

  // Note: Con Paginación
  async findAll(pageOptions: PageOptionsDto): Promise<PageDto<Product>> {
    const { page, limit, filter } = pageOptions;

    const qb = this.repo.createQueryBuilder('product')
      .leftJoinAndSelect('product.productType', 'productType')
      .where('LOWER(product.name) LIKE LOWER(:filter)', { filter: `%${filter}%` })
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, totalItems] = await qb.getManyAndCount();
    return new PageDto<Product>(items, totalItems, { page, limit });
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

  async updateStatus(id: string, isActive: boolean): Promise<Product>{

    await this.repo.update(id, {isActive});
    return this.findOne(id);

  }





}
