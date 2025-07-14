import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InventoryItem } from '../inventory/entities/inventory.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class InventoryItemsService {

  constructor(
    @InjectRepository(InventoryItem)
    private readonly repo: Repository<InventoryItem>
  ) {}

  findOneByProductId(productId: string): Promise<InventoryItem | null >{
    return this.repo.findOne({where: {productId}});
  }

}
