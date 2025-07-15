import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { LowStockParams, MonthlyMovementParams, TopMovingParams } from './dto/dashboard.params.dto';

@Controller('dashboard')
@UsePipes(new ValidationPipe({ transform: true }))
export class DashboardController {

  constructor(
    private readonly dashboardService: DashboardService
  ) {}

  @Get('counts')
  getCounts(){
    return this.dashboardService.getDocCounts();
  }

  @Get('stock-summary')
  getStockSummary(){
    return this.dashboardService.getStockSummary();
  }


  @Get('low-stock') 
  getLowStock(
    @Query() params: LowStockParams,
  ){
    return this.dashboardService.getLowStockItems(params.threshold);
  }

  @Get('monthly-movements')
  getMonthlyMovements(
    @Query() params: MonthlyMovementParams
  ){
     return this.dashboardService.getMonthlyMovements(params.year);
  }

  @Get('top-moving')
  getTopMoving(
    @Query() params: TopMovingParams
  ){
    return this.dashboardService.getTopMovingItems(params.limit);
  }
  


}
