import { Column, Entity, PrimaryColumn } from 'typeorm';


@Entity('inventory_sequence')
export class InventorySequence{

  @PrimaryColumn('varchar',{length: 3 })
  prefix: 'IN' | 'OUT';

  @Column({type: 'int', default: 0})
  lastNumber: number;
}