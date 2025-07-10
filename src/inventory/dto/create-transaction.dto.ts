import { IsInt, IsString, IsUUID } from 'class-validator';


export class CreateTransactionDto {

  @IsUUID()
  itemId: string;

  @IsInt()
  delta: number;

  @IsString()
  reason: string;

}
