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

  listarTodoSinPaginar(): Promise<Product[]>{
    return this.repo.find();
  }

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

  async getActiveProducts(): Promise<{id: string, name:string }[]>{
    const products = await this.repo.find({
      where: {isActive: true},
      select: ['id', 'name']
    });
    return products;
  }

  async getActiveProductsPaginated(pageOptions: PageOptionsDto): Promise<PageDto<{ id: string; name: string }>> {
    const { page, limit, filter } = pageOptions;

    const qb = this.repo.createQueryBuilder('product')
      .select(['product.id', 'product.name'])
      .where('product.isActive = true');

    if (filter) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:filter)', { filter: `%${filter}%` });
    }

    qb.orderBy('product.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, totalItems] = await qb.getManyAndCount();

    return new PageDto(items, totalItems, { page, limit }); // 👈 ESTA ES LA CLAVE
  }

  async getActiveProductsWithStock(): Promise<{ id: string; name: string; stock: number }[]> {
    // Traemos productos activos con sus líneas y documentos relacionados
    const products = await this.repo.find({
      where: { isActive: true },
      relations: ['inventories', 'inventories.document'],
    });

    const result = [];

    for (const product of products) {
      const lines = product.inventories;

      const totalIn = lines
        .filter(line => line.document.type === 'IN')
        .reduce((sum, line) => sum + line.quantity, 0);

      const totalOut = lines
        .filter(line => line.document.type === 'OUT')
        .reduce((sum, line) => sum + line.quantity, 0);

      const stock = totalIn - totalOut;

      if (stock > 0) {
        result.push({
          id: product.id,
          name: product.name,
          stock,
        });
      }
    }

    return result;
  }

  async getActiveProductsWithStockPaginated(pageOptions: PageOptionsDto): Promise<PageDto<{ id: string; name: string; stock: number }>> {
    const { page, limit, filter } = pageOptions;

    const qb = this.repo.createQueryBuilder('product')
      .leftJoinAndSelect('product.inventories', 'inventory')
      .leftJoinAndSelect('inventory.document', 'document')
      .where('product.isActive = true');

    if (filter) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:filter)', { filter: `%${filter}%` });
    }

    qb.skip((page - 1) * limit).take(limit);

    const [products, totalItems] = await qb.getManyAndCount();

    const result = [];

    for (const product of products) {
      const lines = product.inventories;

      const totalIn = lines
        .filter(line => line.document.type === 'IN')
        .reduce((sum, line) => sum + line.quantity, 0);

      const totalOut = lines
        .filter(line => line.document.type === 'OUT')
        .reduce((sum, line) => sum + line.quantity, 0);

      const stock = totalIn - totalOut;

      if (stock > 0) {
        result.push({
          id: product.id,
          name: product.name,
          stock,
        });
      }
    }
    return new PageDto(result, result.length, { page, limit });
  }

}
