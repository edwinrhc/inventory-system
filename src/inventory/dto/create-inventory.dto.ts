import { IsInt, IsUUID, Min } from 'class-validator';


export class CreateInventoryDto{

  @IsUUID()
  productId: string;

  @IsInt()
  @Min(0)
  quantity: number;

}
