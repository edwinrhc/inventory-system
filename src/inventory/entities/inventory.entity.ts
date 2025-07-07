import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';


@Entity('inventory')
export class InventoryItem {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.id, {eager: true})
  product: Product;

  @Column('int')
  quantity: number;

  @Column('varchar',{ length: 50,default: 'available'})
  status: string; // available, reserved, sold

}
