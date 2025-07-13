import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StockReportService } from './stock-report.service';
import { Roles } from '../auth/roles.decorator';
import { StockReportDto } from './dto/stock-report.dto';
import { Role } from '../users/role.enum';

@ApiTags('report')
@ApiBearerAuth()
@Controller('report')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StockReportController {

  constructor(private readonly stockSvc: StockReportService) {}


  @Get('stock')
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({summary: 'Generar reporte de stock'})
  @ApiResponse({status:200, description: 'Reporte de stock generado.'})
  getStock():Promise<StockReportDto[]>{
    return this.stockSvc.getStockReport()
  }


}
