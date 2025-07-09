import { Injectable, NotFoundException } from '@nestjs/common';
import { LessThanOrEqual, Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Product } from "../products/entities/product.entity";
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@Injectable()
export class InventoryService {
  
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepo: Repository<InventoryItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>

  ){}

  async create(dto: CreateInventoryDto): Promise<InventoryItem> {
    // Resolvemos la relación product
    const product = await this.productRepo.findOne({
      where: {id: dto.productId}
    })
    if(!product) throw new NotFoundException(`Producto ${dto.productId} no existe`);

    const invetory = this.inventoryRepo.create({
      product,
      quantity: dto.quantity
    });
    return this.inventoryRepo.save(invetory);
  }

  findAll(): Promise<InventoryItem[]>{
    return this.inventoryRepo.find();
  }

  async findOne(id: string): Promise<InventoryItem>{
    const inventory = await this.inventoryRepo.findOne({where: {id}});
    if(!inventory) throw new NotFoundException(`Inventory item ${id} no existe`);
    return inventory;
  }

  async update(id: string, dto: UpdateInventoryDto): Promise<InventoryItem> {
    const inventory = await this.findOne(id);

  // Si envían productId, resolvemos la nueva relación
  if(dto.productId){
    const product = await this.productRepo.findOne({
        where: {id: dto.productId}
      });
    if(!product) throw new NotFoundException(`Producto ${dto.productId} no existe`);
    inventory.product = product;
  }

    if (dto.quantity !== undefined) {
      inventory.quantity = dto.quantity;
    }

    if (dto.status !== undefined) {
      inventory.status = dto.status;
    }

    return this.inventoryRepo.save(inventory);
  }

  async remove(id: string): Promise<void>{
    const result = await this.inventoryRepo.delete(id);
    if(result.affected === 0){
      throw new NotFoundException(`Inventario ${id} no existe`);
    }
  }

  async adjust(id: string, dto: AdjustInventoryDto ){

    const item = await this.inventoryRepo.findOne({where: {id}});

    if(!item) throw new NotFoundException(`Ítem ${id} no existe`);

    const nuevaCantidad = item.quantity + dto.delta;
    if(nuevaCantidad < 0){
      throw new NotFoundException(`Cantidad insuficiente para realizar la operación`);
    }
    item.quantity = nuevaCantidad;
    return this.inventoryRepo.save(item);

  }


  async findLowStock(threshold: number){
    return this.inventoryRepo.find({where: {quantity: LessThanOrEqual(threshold)}})
  }


  async search(name?: string, status?: string) {
    const qb = this.inventoryRepo.createQueryBuilder('inv')
      .leftJoinAndSelect('inv.product', 'prod');
    if (name)    qb.andWhere('prod.name LIKE :name', { name: `%${name}%` });
    if (status)  qb.andWhere('inv.status = :status', { status });
    return qb.getMany();
  }


  
  
  
}
