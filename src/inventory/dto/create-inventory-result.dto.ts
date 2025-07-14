import { InventoryDocument } from '../entities/inventory-document.entity';

export class CreateInventoryResult  {
  document: InventoryDocument;
  warnings: string[];
}