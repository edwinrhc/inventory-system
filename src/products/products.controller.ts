// src/products/products.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param, ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post, Query,
  UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard }       from '@nestjs/passport';
import { RolesGuard }      from '../auth/roles.guard';
import { Roles }           from '../auth/roles.decorator';
import { Role }            from '../users/role.enum';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PageOptionsDto } from '../common/dto/page-options.dto';
import { PageDto } from '../common/dto/page.dto';
import { Product } from './entities/product.entity';
import { UpdateStatusDto } from '../common/dto/update-status.dto';

@ApiTags('products')
@ApiBearerAuth()                       // Indica que este controlador usa JWT Bearer
@Controller('products')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Aplica Auth + RolesGuard a todas las rutas
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Rol no autorizado.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.service.create(dto);
  }

  @Get('listar-sin-paginar')
  @Roles(Role.ADMIN, Role.VENDOR, Role.SUPPLIER)
  @ApiOperation({ summary: 'Listar todos los productos sin paginar' })
  @ApiResponse({ status: 200, description: 'Lista de productos sin paginar.' })
  listarTodoSinPaginar() {
    return this.service.listarTodoSinPaginar();
  }

  //Note: Con Paginación
  @Get()
  @Roles(Role.ADMIN, Role.VENDOR, Role.SUPPLIER)
  @ApiOperation({ summary: 'Listar todos los productos' })
  @ApiResponse({ status: 200, description: 'Lista de productos.' })
  findAll(
    @Query() pageOptions: PageOptionsDto): Promise<PageDto<Product>>{
    return this.service.findAll(pageOptions);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.VENDOR, Role.SUPPLIER)
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Producto encontrado.' })
  @ApiResponse({ status: 404, description: 'Producto no existe.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({ summary: 'Actualizar un producto por ID' })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Producto actualizado.' })
  @ApiResponse({ status: 404, description: 'Producto no existe.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un producto por ID' })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Producto eliminado.' })
  @ApiResponse({ status: 404, description: 'Producto no existe.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar estado del producto por ID' })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Producto actualizado.' })
  @ApiResponse({ status: 404, description: 'Producto no existe.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto
  ):Promise<Product>{
    return this.service.updateStatus(id,dto.isActive);
  }

}
