import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  
  constructor(
    @InjectRepository(InventoryItem)
    private readonly repo: Repository<InventoryItem>
  ){}

  async create(dto: CreateInventoryDto): Promise<InventoryItem> {
    const invetory = this.repo.create(dto);
    return this.repo.save(invetory);
  }

  findAll(): Promise<InventoryItem[]>{
    return this.repo.find();
  }

  async findOne(id: string): Promise<InventoryItem>{
    const inventory = await this.repo.findOne({where: {id}});
    if(!inventory) throw new NotFoundException(`Producto ${id} no existe`);
    return inventory;
  }

  async update(id: string, dto: UpdateInventoryDto): Promise<InventoryItem> {
    const inventory = await this.findOne(id);
    Object.assign(inventory, dto);
    return this.repo.save(inventory);
  }

  async remove(id: string): Promise<void>{
    const result = await this.repo.delete(id);
    if(result.affected === 0){
      throw new NotFoundException(`Inventario ${id} no existe`);
    }
  }


  
  
  
}
