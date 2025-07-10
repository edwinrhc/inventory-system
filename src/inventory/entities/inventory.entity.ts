import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';


@Entity('inventory')
export class InventoryItem {

  @PrimaryGeneratedColumn('uuid')
  id: string;



  @ManyToOne(() => Product, product => product.inventories, {
    onDelete: 'CASCADE',   // ← asegura que la FK en SQL tenga ON DELETE CASCADE
  })
  @JoinColumn({ name: 'productId' })
  product: Product;


  @Column('uuid')
  productId: string;

  @Column('int')
  quantity: number;

  @Column('varchar',{ length: 50,default: 'available'})
  status: string; // available, reserved, sold


}
