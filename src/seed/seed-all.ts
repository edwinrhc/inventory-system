import { DataSource, DataSourceOptions } from 'typeorm';
import { typeOrmConfig } from '../config/typeorm.config';
import { Product } from '../products/entities/product.entity';
import { InventoryItem } from '../inventory/entities/inventory.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/role.enum';
import * as bcrypt from 'bcryptjs';
import { join } from 'path';


const seedDataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: +process.env.DB_PORT! || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '123456',
  database: process.env.DB_NAME || 'inventory_db',
  entities: [Product, InventoryItem, User],
  synchronize: false,
  logging: false,
};

async function runSeeds() {
  const ds = new DataSource(seedDataSourceOptions);
  await ds.initialize();

  const userRepo = ds.getRepository(User);
  const productRepo = ds.getRepository(Product);
  const inventoryRepo = ds.getRepository(InventoryItem);

  // 1) Usuarios
  const users = [
    { username: 'admin', password: 'admin123', role: Role.ADMIN },
    { username: 'vendedor', password: 'vendor123', role: Role.VENDOR },
    { username: 'proveedor', password: 'supplier123', role: Role.SUPPLIER },
  ];
  for (const u of users) {
    if (await userRepo.findOneBy({ username: u.username })) continue;
    const hashed = await bcrypt.hash(u.password, 10);
    await userRepo.save(userRepo.create({ username: u.username, password: hashed, role: u.role }));
  }

  // 2) Productos
  const products = [
    { sku: 'PROD-1', name: 'Martillo', description: 'Martillo de acero', price: 15.75 },
    { sku: 'PROD-2', name: 'Destornillador', description: 'Phillips #2', price: 7.2 },
    { sku: 'PROD-7', name: 'Llave de carraca', description: '1/2\" mango antideslizante', price: 22.5 },
  ];
  for (const p of products) {
    if (await productRepo.findOneBy({ sku: p.sku })) continue;
    const saved = await productRepo.save(productRepo.create(p as Product));
    console.log(`Producto seed: ${p.sku} -> ${saved.id}`);
  }

  // 3) Inventario
  const allProducts = await productRepo.find();
  for (const prod of allProducts) {
    if (await inventoryRepo.findOneBy({ productId: prod.id })) continue;
    await inventoryRepo.save(
      inventoryRepo.create({ product: prod, productId: prod.id, quantity: 10, status: 'available' }),
    );
  }

  await ds.destroy();
  console.log('Seed completo');
}

runSeeds().catch(e => { console.error(e); process.exit(1); });
