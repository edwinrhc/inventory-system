import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';


export class LowStockParams {
  @IsOptional()
  @Type(()=> Number)
  @IsInt()
  @Min(1)
  threshold: number = 10;

}

export class MonthlyMovementParams {
  @Type(()=> Number)
  @IsInt()
  year: number;
}

export class TopMovingParams{
  @IsOptional()
  @Type(()=> Number)
  @IsInt()
  @Min(1)
  limit?: number = 5;
}