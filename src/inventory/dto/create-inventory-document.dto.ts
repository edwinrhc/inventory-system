import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';


export class CreateInventoryLineDto{

  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsString()
  detail?: string;

}


export class CreateInventoryDocumentDto{

  @IsEnum(['IN', 'OUT'])
  type: 'IN'| 'OUT';

  @IsString()
  reference: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryLineDto)
  lines: CreateInventoryLineDto[];


}
