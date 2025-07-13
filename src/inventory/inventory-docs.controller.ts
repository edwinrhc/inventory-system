import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { InventoryDocsService } from './inventory-docs.service';
import { Role } from '../users/role.enum';
import { Roles } from '../auth/roles.decorator';
import { CreateInventoryDocumentDto } from './dto/create-inventory-document.dto';
import { GetUserId } from '../common/decorators/get-user-id.decorator';
import { PageDto } from '../common/dto/page.dto';
import { InventoryDocument } from './entities/inventory-document.entity';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';

@ApiTags('inventory-documents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('inventory-documents')
export class InventoryDocsController {

  constructor(
    private readonly docsService: InventoryDocsService
  ) {}


  @Get('next-reference')
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({summary: 'Obtener siguiente referencia para un tipo de documento'})
  nextReference(@Query('type') type:'IN'|'OUT'):Promise<string>{
    return this.docsService.getNextReference(type);
  }

  @Get('peek-reference')
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({summary: 'Obtener siguiente referencia para un tipo de documento'})
  nextReferencePeek(@Query('type') type:'IN'|'OUT'):Promise<string>{
    return this.docsService.peekNextReference(type);
  }


  @Post()
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({ summary: 'Crear guía de Ingreso/Salida' })
  create(
    @Body() dto: CreateInventoryDocumentDto,
    @GetUserId() userId: string,     // ← recupera directamente
    // @Req() req,
  ) {
    // console.log('REQ.USER ➜', req.user);
    // return this.docsService.createDocument(dto, req.userId);
    return this.docsService.createDocument(dto, userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({ summary: 'Listar todos los productos de Ingreso/Salida' })
  findAll(
    @Query()pageOptions: PageOptionsDto): Promise<PageDto<InventoryDocument>>{
     return this.docsService.findAll(pageOptions);
  }







}
