import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes, ValidationPipe,
} from '@nestjs/common';
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
import { PageOptionsDto } from '../common/dto/page-options.dto';
import { PageDto } from '../common/dto/page.dto';
import { ProductType } from './entities/product-type.entity';
import { UpdateStatusDto } from '../common/dto/update-status.dto';
import { Product } from '../products/entities/product.entity';

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

 /* @Get()
  @Roles(Role.ADMIN, Role.VENDOR, Role.SUPPLIER)
  @ApiOperation({ summary: 'Listar todos los tipos de productos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de productos.' })
  findAll(){
    return this.service.findAll();
  }*/

  //Note: Paginación
  @Get()
  @Roles(Role.ADMIN, Role.VENDOR, Role.SUPPLIER)
  @ApiOperation({ summary: 'Listar todos los tipos de productos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de productos.' })
  findAll(@Query() pageOptions: PageOptionsDto): Promise<PageDto<ProductType>>{
    return this.service.findAll(pageOptions);
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

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar estado del tipo del producto por ID' })
  @ApiParam({ name: 'id', description: 'UUID del tipo del producto' })
  @ApiResponse({ status: 200, description: 'Tipo Producto actualizado.' })
  @ApiResponse({ status: 404, description: 'Tipo Producto no existe.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateTypeProductStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto
  ):Promise<ProductType>{
    return this.service.updateStatus(id,dto.isActive);
  }


}
