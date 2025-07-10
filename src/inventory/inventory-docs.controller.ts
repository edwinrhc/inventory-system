import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { InventoryDocsService } from './inventory-docs.service';
import { Role } from '../users/role.enum';
import { Roles } from '../auth/roles.decorator';
import { CreateInventoryDocumentDto } from './dto/create-inventory-document.dto';

@ApiTags('inventory-documents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('inventory-documents')
export class InventoryDocsController {

  constructor(
    private readonly docsService: InventoryDocsService
  ) {}


  @Post()
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({ summary: 'Crear guía de Ingreso/Salida' })
  create(
    @Body() dto: CreateInventoryDocumentDto,
    @Req() req,
  ) {
    return this.docsService.createDocument(dto, req.user.id);
  }



}
