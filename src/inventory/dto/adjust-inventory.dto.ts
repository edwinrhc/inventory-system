import { IsInt } from 'class-validator';


export class AdjustInventoryDto{

  @IsInt()
  delta: number; // positivo o negativo
}
