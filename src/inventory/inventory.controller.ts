import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/role.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({ summary: 'Crear un nuevo ítem de inventario' })
  @ApiResponse({ status: 201, description: 'Ítem creado exitosamente.' })
  create(@Body() dto: CreateInventoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.VENDOR, Role.SUPPLIER)
  @ApiOperation({ summary: 'Listar todos los ítems de inventario' })
  @ApiResponse({ status: 200, description: 'Lista de inventario.' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.VENDOR, Role.SUPPLIER)
  @ApiOperation({ summary: 'Obtener un ítem de inventario por ID' })
  @ApiParam({ name: 'id', description: 'UUID del inventario' })
  @ApiResponse({ status: 200, description: 'Ítem encontrado.' })
  @ApiResponse({ status: 404, description: 'Ítem no existe.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({ summary: 'Actualizar un ítem de inventario por ID' })
  @ApiParam({ name: 'id', description: 'UUID del inventario' })
  @ApiResponse({ status: 200, description: 'Ítem actualizado.' })
  @ApiResponse({ status: 404, description: 'Ítem no existe.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un ítem de inventario por ID' })
  @ApiParam({ name: 'id', description: 'UUID del inventario' })
  @ApiResponse({ status: 200, description: 'Ítem eliminado.' })
  @ApiResponse({ status: 404, description: 'Ítem no existe.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/in')
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({ summary: 'Registrar entrada de stock' })
  in(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AdjustInventoryDto) {
    return this.service.adjust(id, { delta: Math.abs(dto.delta) });
  }

  @Patch(':id/out')
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({ summary: 'Registrar salida de stock' })
  out(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AdjustInventoryDto) {
    return this.service.adjust(id, { delta: -Math.abs(dto.delta) });
  }

  @Get('reports/low-stock')
  @Roles(Role.ADMIN, Role.VENDOR, Role.SUPPLIER)
  @ApiOperation({ summary: 'Listar ítems con stock por debajo del umbral' })
  @ApiQuery({
    name: 'threshold',
    description: 'Cantidad mínima de stock',
    required: false,
    type: Number,
  })
  lowStock(
    @Query('threshold', new DefaultValuePipe(10), ParseIntPipe)
    threshold: number,
  ) {
    return this.service.findLowStock(threshold);
  }


  @Get('product/search')
  @ApiOperation({ summary: 'Buscar inventario por producto o estado' })
  @ApiQuery({ name: 'productName', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['available','reserved','sold'] })
  search(
    @Query('productName') name?: string,
    @Query('status') status?: 'available' | 'reserved' | 'sold',
  ) {
    return this.service.search(name, status);
  }


}
