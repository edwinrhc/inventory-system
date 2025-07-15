import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InventoryDocument } from './inventory-document.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('inventory_lines')
export class InventoryLine {


  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InventoryDocument, doc => doc.lines)
  @JoinColumn({ name: 'documentId' })
  document: InventoryDocument;

  @Column('uuid')
  documentId: string;


  @ManyToOne(() => Product, product => product.inventories)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column('uuid')
  productId: string;

  @Column('int')
  quantity: number;

  @Column('decimal',{precision: 10, scale: 2,nullable: true})
  unitPrice?: number;

  @Column('text', {nullable: true})
  detail?: string;



}
