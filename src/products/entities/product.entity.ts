import {PrimaryGeneratedColumn,Column, Entity } from 'typeorm';

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

}
