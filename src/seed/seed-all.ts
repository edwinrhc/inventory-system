import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import * as bcrypt from 'bcryptjs';

import { User } from '../users/entities/user.entity';
import { Role } from '../users/role.enum';

import { Product } from '../products/entities/product.entity';
import { InventoryItem } from '../inventory/entities/inventory.entity';
import { Transaction } from '../inventory/entities/transaction.entity';
import { ProductType } from '../product-types/product-type.entity';
import { InventoryDocument } from '../inventory/entities/inventory-document.entity';
import { InventoryLine } from '../inventory/entities/inventory-line.entity';

const seedDataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: +process.env.DB_PORT! || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '123456',
  database: process.env.DB_NAME || 'inventory_db',
  // entities: [Product, InventoryItem, User,Transaction],
  entities: [join(__dirname, '/../**/*.entity{.ts,.js}')],
  synchronize: false,
  logging: false,
};

async function runSeeds() {
  const ds = new DataSource(seedDataSourceOptions);
  await ds.initialize();


  const transactionRepo = ds.getRepository(Transaction);

  // 1) Usuarios
  const userRepo = ds.getRepository(User);
  const users = [
    { username: 'admin', password: 'admin123', role: Role.ADMIN },
    { username: 'vendedor', password: 'vendor123', role: Role.VENDOR },
    { username: 'proveedor', password: 'supplier123', role: Role.SUPPLIER },
  ];
  for (const u of users) {
    if (await userRepo.findOneBy({ username: u.username })) continue;
    const hashed = await bcrypt.hash(u.password, 10);
    await userRepo.save(
      userRepo.create({
        username: u.username,
        password: hashed,
        role: u.role }),
    );
  }
  console.log('✅ Usuarios seed completos');

  // 2) Tipos de Producto
  const typeProductRepo = ds.getRepository(ProductType);
  const types = [
    { name: 'Herramientas', description: 'Herramientas manuales y eléctricas' },
    { name: 'Accesorios',   description: 'Accesorios y repuestos' },
    { name: 'Consumibles',  description: 'Tornillos, tuercas, lijas, etc.' },
  ];
  for (const t of types) {
    if (await typeProductRepo.findOneBy({ name: t.name })) continue;
    await typeProductRepo.save(typeProductRepo.create(t));
  }
  console.log('✅ Tipos de producto seed completados');


  // 3) Productos
  const productRepo = ds.getRepository(Product);
  const allTypes    = await typeProductRepo.find();
  const products = [
    {
      sku:           'PROD-1',
      name:          'Martillo',
      description:   'Martillo de acero',
      price:         15.75,
      productTypeId: allTypes[0].id, // Herramientas
    },
    {
      sku:           'PROD-2',
      name:          'Destornillador',
      description:   'Phillips #2',
      price:         7.2,
      productTypeId: allTypes[0].id, // Herramientas
    },
    {
      sku:           'PROD-3',
      name:          'Taladro Percutor',
      description:   'Bosh',
      price:         237.2,
      productTypeId: allTypes[1].id, // Accesorios
    },
    {
      sku:           'PROD-4',
      name:          'Alicate',
      description:   'Bosh #4',
      price:         27.2,
      productTypeId: allTypes[1].id, // Accesorios
    },
    {
      sku:           'PROD-5',
      name:          'Lijadora',
      description:   'Phillips #2',
      price:         150,
      productTypeId: allTypes[2].id, // Consumibles
    },
    {
      sku:           'PROD-6',
      name:          'Atornillador',
      description:   'Makita',
      price:         350,
      productTypeId: allTypes[0].id, // Herramientas
    },
    {
      sku:           'PROD-7',
      name:          'Llave de carraca',
      description:   '1/2" mango antideslizante',
      price:         22.5,
      productTypeId: allTypes[2].id, // Consumibles
    },
  ];
  for (const p of products) {
    if (await productRepo.findOneBy({ sku: p.sku })) continue;
    const saved = await productRepo.save(productRepo.create(p as Product));
    console.log(`Producto seed: ${p.sku} -> ${saved.id}`);
  }
  console.log('✅ Productos seed completados');

  // 4) Inventario
  const inventoryRepo = ds.getRepository(InventoryItem);
  const allProducts = await productRepo.find();
  for (const prod of allProducts) {
    if (await inventoryRepo.findOneBy({ productId: prod.id })) continue;
    await inventoryRepo.save(
      inventoryRepo.create({
        product: prod,
        productId: prod.id,
        quantity: 10,
        status: 'available',
      }),
    );
  }
  console.log('✅ Inventario seed completado');


  // 5) Documentos de Inventario y Líneas
  const docRepo  = ds.getRepository(InventoryDocument);
  const lineRepo = ds.getRepository(InventoryLine);

  // 5.1) Creamos una guía de ingreso con 2 líneas
  const adminUser = await userRepo.findOneBy({ username: 'admin' });
  const docIn = docRepo.create({
    type:      'IN' as const,
    date:      new Date(),
    reference: 'SEED-IN-001',
    notes:     'Ingreso semilla',
    userId:    adminUser.id,
    lines: [
      { productId: allProducts[0].id, quantity: 5, unitPrice: 15.75, detail: 'Lote A' },
      { productId: allProducts[1].id, quantity: 3, unitPrice: 7.20,  detail: 'Lote B' },
    ],
  });
  await docRepo.save(docIn);
  console.log(`✅ Documento IN creado: ${docIn.id}`);

  // 5.2) Creamos una guía de salida con 1 línea
  const docOut = docRepo.create({
    type:      'OUT' as const,
    date:      new Date(),
    reference: 'SEED-OUT-001',
    notes:     'Salida semilla',
    userId:    adminUser.id,
    lines: [
      { productId: allProducts[2].id, quantity: 2, detail: 'Para demo' },
    ],
  });
  await docRepo.save(docOut);
  console.log(`✅ Documento OUT creado: ${docOut.id}`);

  // 5.3) Ajustamos el stock manualmente para reflejar estos movimientos
  await Promise.all(docIn.lines.map(line =>
    inventoryRepo.increment({ productId: line.productId }, 'quantity', line.quantity)
  ));
  await Promise.all(docOut.lines.map(line =>
    inventoryRepo.decrement({ productId: line.productId }, 'quantity', line.quantity)
  ));
  console.log('✅ Ajuste de stock por documentos completo');


  await ds.destroy();
  console.log('Seed completo');
}

runSeeds()
  .catch(e => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  });
