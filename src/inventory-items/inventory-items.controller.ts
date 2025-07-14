import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { InventoryItemsService } from './inventory-items.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/role.enum';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('inventory-items')
export class InventoryItemsController {

  constructor(private readonly itemsSvc: InventoryItemsService) {}

  @Get(':productId')
  @Roles(Role.ADMIN, Role.VENDOR, Role.SUPPLIER)
  @ApiOperation({ summary: 'Producto encontrado' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  async getByProdutId(@Param('productId') productId: string){
    const item = await this.itemsSvc.findOneByProductId(productId);
    if(!item){
      throw new NotFoundException(`No hay inventario para producto ${productId}`);
    }
    return { productId: item.productId, quantity: item.quantity}
  }



}
