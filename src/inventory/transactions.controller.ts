import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InventoryService } from './inventory.service';
import { Role } from '../users/role.enum';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('inventory/transactions')
export class TransactionsController {

  constructor(
    @Inject(forwardRef(() => InventoryService))
    private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({summary: 'Registrar una transacción de inventario'})
  @ApiResponse({status: 201, description: 'Transacción creada.'})
  create(@Body()dto: CreateTransactionDto){
    return this.inventoryService.createTransaction(dto);
  }


  @Get(':itemId')
  @Roles(Role.ADMIN, Role.VENDOR, Role.SUPPLIER)
  @ApiOperation({ summary: 'Historial de transacciones de un ítem'})
  @ApiParam({name: 'itemId', description: 'UUID del ítem de inventario' })
  @ApiQuery({name: 'limit', required: false, type: Number, description: 'Límite de registros a devolver'})
  @ApiResponse({status: 200, description: 'Lista de transacciones.'})
  findByItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Query('limit') limit?: number
  ){
    return this.inventoryService.getTransactions(itemId, limit);
  }


}
