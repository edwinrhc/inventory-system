import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class ProductType {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({length:100, unique: true})
  name: string;

  @Column({type:'text',nullable: true})
  description?: string;

  @OneToMany(() => Product, product => product.productType)
  products: Product[];


  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true, eager: true })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true, eager: true })
  updatedBy?: User;

}
