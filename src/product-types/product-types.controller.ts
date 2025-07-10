import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation, ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { ProductTypesService } from './product-types.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { Role } from '../users/role.enum';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Product Types')
@ApiBearerAuth()
@Controller('product-types')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProductTypesController {
  constructor(private readonly service: ProductTypesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({ summary: 'Crear un nuevo tipo de producto' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de Producto creado exitosamente.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden. Rol no autorizado.' })
  create(@Body() dto: CreateProductTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.VENDOR, Role.SUPPLIER)
  @ApiOperation({ summary: 'Listar todos los tipos de productos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de productos.' })
  findAll(){
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.VENDOR, Role.SUPPLIER)
  @ApiOperation({ summary: 'Obtener un tipo de producto por ID' })
  @ApiResponse({ status: 200, description: 'Tipo de Producto encontrado.' })
  @ApiResponse({ status: 404, description: 'Tipo de Producto no existe.' })
  findOne(@Param('id', ParseUUIDPipe)id: string){
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({ summary: 'Actualizar un tipo de producto por ID' })
  @ApiParam({name:'id', description: 'UUID del tipo de producto'})
  @ApiResponse({ status: 200, description: 'Tipo de Producto actualizado.' })
  @ApiResponse({ status: 404, description: 'Tipo de Producto no existe.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Rol no autorizado.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProductTypeDto,
  ){
    return this.service.update(id,dto);
  }


  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un tipo de producto por ID' })
  @ApiParam({name:'id', description: 'UUID del tipo de producto'})
  @ApiResponse({ status: 200, description: 'Tipo de Producto eliminado.' })
  @ApiResponse({ status: 404, description: 'Tipo de Producto no existe.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Rol no autorizado.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }


}
