import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Entity()
export class ProductType {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({length:100})
  name: string;

  @Column({type:'text',nullable: true})
  description?: string;

  @OneToMany(() => Product, product => product.productType)
  products: Product[];

}
