import { IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';


export class CreateInventoryDto{

  @IsUUID()
  productId: string;

  @IsInt()
  @Min(0)
  quantity: number;


  @IsOptional()
  @IsString()
  @IsIn(['available', 'reserved', 'sold'])
  status?: string;

}
