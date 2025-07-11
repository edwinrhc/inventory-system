import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { InventoryItem } from '../../inventory/entities/inventory.entity';
import { ProductType } from '../../product-types/entities/product-type.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('products')
export class Product {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({unique: true})
  sku: string;

  @Column({length: 255, unique: true})
  name: string;

  @Column('text', {nullable: true})
  description: string;

  @Column('decimal',{precision: 10, scale: 2})
  price: number;

  // ← Relación OneToMany: un producto puede tener muchos inventarios
  @OneToMany(() => InventoryItem, inventory => inventory.product, {
    cascade: ['remove'],    // opcional: activa borrado en cascada desde TypeORM
  })
  inventories: InventoryItem[];
  
  @ManyToOne(() => ProductType, (type) => type.products, {nullable: true})
  @JoinColumn({name: 'productTypeId'})
  productType?: ProductType;

  @Column({type: 'uuid', nullable: true})
  productTypeId?: string;


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
