import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { InventoryItem } from '../../inventory/entities/inventory.entity';

@Entity('products')
export class Product {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({unique: true})
  sku: string;

  @Column()
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

}
