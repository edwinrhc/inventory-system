import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StockReportService } from './stock-report.service';
import { Roles } from '../auth/roles.decorator';
import { StockReportDto } from './dto/stock-report.dto';
import { Role } from '../users/role.enum';
import { PageOptionsDto } from '../common/dto/page-options.dto';

@ApiTags('report')
@ApiBearerAuth()
@Controller('report')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StockReportController {

  constructor(private readonly stockSvc: StockReportService) {}


  @Get('stock-sin-page')
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({summary: 'Generar reporte de stock'})
  @ApiResponse({status:200, description: 'Reporte de stock generado.'})
  getStockSinPage():Promise<StockReportDto[]>{
    return this.stockSvc.getStockReport()
  }

  @Get('stock')
  @Roles(Role.ADMIN, Role.VENDOR)
  @ApiOperation({summary: 'Generar reporte de stock'})
  @ApiResponse({status:200, description: 'Reporte de stock generado.'})
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'filter', required: false })
  getReport(@Query() pageOptions: PageOptionsDto) {
    return this.stockSvc.getStockReportPaginated(pageOptions);
  }


}
