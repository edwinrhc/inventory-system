import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InventoryLine } from './inventory-line.entity';


@Entity('inventory_documents')
export class InventoryDocument {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'enum', enum: ['IN', 'OUT']})
  type: 'IN'| 'OUT';

  @Column()
  date: Date;

  @Column({length:255})
  reference: string;

  @Column({ type:'text', nullable: true})
  notes?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({type: 'uuid'})
  userId: string;

  @OneToMany( ()=> InventoryLine, line => line.document, {cascade: true})
  lines: InventoryLine[];



}
