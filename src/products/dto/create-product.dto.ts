import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';


export class CreateProductDto {

  @IsString() @IsNotEmpty()
  sku: string;

  @IsString() @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  @IsNumber() @Min(0)
  price: number;

  @IsUUID()
  productTypeId: string;

}
