import { IsOptional, IsString, MaxLength } from 'class-validator';


export class CreateProductTypeDto{

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

}
