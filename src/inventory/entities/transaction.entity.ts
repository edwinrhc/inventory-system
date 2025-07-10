import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InventoryItem } from './inventory.entity';


@Entity()
export class Transaction {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InventoryItem,{eager: true})
  item: InventoryItem;

  @Column('int')
  delta: number;

  @Column({length: 255})
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

}
