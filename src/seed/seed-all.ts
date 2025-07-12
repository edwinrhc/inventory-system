import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import * as bcrypt from 'bcryptjs';

import { User } from '../users/entities/user.entity';
import { Role } from '../users/role.enum';

import { Product } from '../products/entities/product.entity';
import { InventoryItem } from '../inventory/entities/inventory.entity';
import { Transaction } from '../inventory/entities/transaction.entity';
import { ProductType } from '../product-types/entities/product-type.entity';
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

  const adminUser = await userRepo.findOneBy({ username: 'admin' });
  // 2) Tipos de Producto

  const typeProductRepo = ds.getRepository(ProductType);
  const types = [
    { name: 'Herramientas manuales',        description: 'Llaves, martillos y cinceles' },
    { name: 'Herramientas eléctricas',      description: 'Taladros, sierras y lijadoras' },
    { name: 'Accesorios',                   description: 'Brocas, discos y hojas de sierra' },
    { name: 'Consumibles',                  description: 'Tornillos, tuercas y arandelas' },
    { name: 'Jardinería',                   description: 'Tijeras, mangueras y palas' },
    { name: 'Pintura y revestimientos',     description: 'Brochas, rodillos y selladores' },
    { name: 'Fontanería',                   description: 'Tubos, uniones y válvulas' },
    { name: 'Electricidad',                 description: 'Interruptores, enchufes y cables' },
    { name: 'Carpintería',                  description: 'Sargentos, cepillos y escuadras' },
    { name: 'Cerrajería',                   description: 'Candados, cerraduras y bisagras' },
    { name: 'Automoción',                   description: 'Herramientas para autos y motos' },
    { name: 'Soldadura',                    description: 'Electrodos, alambres y máscaras' },
    { name: 'Maquinaria pesada',            description: 'Bombas, compresores y generadores' },
    { name: 'Iluminación',                  description: 'Lámparas, tubos y reflectores' },
    { name: 'Seguridad industrial',         description: 'Cascos, guantes y gafas' },
    { name: 'Adhesivos y selladores',       description: 'Silicona, pegamentos y masillas' },
    { name: 'Ferretería industrial',        description: 'Cadenas, poleas y engranajes' },
    { name: 'Equipos de medición',          description: 'Multímetros, calibres y niveles' },
    { name: 'Calefacción y climatización',  description: 'Radiadores, ventiladores y termostatos' },
    { name: 'Refrigeración',                description: 'Condensadores, compresores y evaporadores' },
    { name: 'Herramientas neumáticas',      description: 'Pistolas, compresores y mangueras' },
    { name: 'Equipos de limpieza',          description: 'Aspiradoras, hidrolavadoras y mopas' },
    { name: 'Accesorios de instalación',    description: 'Tuberías, soportes y abrazaderas' },
    { name: 'Protección personal',          description: 'Mascotas, tapones y arneses' },
    { name: 'Repuestos y recambios',        description: 'Filtros, juntas y rodamientos' }
  ];

  for (const t of types) {
    if (await typeProductRepo.findOneBy({ name: t.name })) continue;

    const newType = typeProductRepo.create({
      ...t,
      isActive: true,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
    await typeProductRepo.save(typeProductRepo.create(newType));
  }
  console.log('✅ Tipos de producto seed completados');


  // 3) Productos
  const productRepo = ds.getRepository(Product);
  const allTypes    = await typeProductRepo.find();
  const products =
    [
      { "sku": "PROD-1",  "name": "Martillo",          "description": "Martillo de acero",             "price": 15.75, "productTypeId": allTypes[0].id },
      { "sku": "PROD-2",  "name": "Destornillador",    "description": "Phillips #2",                  "price": 7.20,  "productTypeId": allTypes[0].id },
      { "sku": "PROD-3",  "name": "Taladro Percutor",  "description": "Bosh",                          "price": 237.20,"productTypeId": allTypes[1].id },
      { "sku": "PROD-4",  "name": "Alicate",           "description": "Bosh #4",                       "price": 27.20, "productTypeId": allTypes[1].id },
      { "sku": "PROD-5",  "name": "Lijadora",          "description": "De disco",                      "price": 150.00,"productTypeId": allTypes[2].id },
      { "sku": "PROD-6",  "name": "Atornillador",      "description": "Makita inalámbrico",            "price": 350.00,"productTypeId": allTypes[0].id },
      { "sku": "PROD-7",  "name": "Llave de carraca",  "description": "1/2\" mango antideslizante",    "price": 22.50, "productTypeId": allTypes[2].id },
      { "sku": "PROD-8",  "name": "Cincel",            "description": "Cincel para concreto",          "price": 18.00, "productTypeId": allTypes[0].id },
      { "sku": "PROD-9",  "name": "Sierra de mano",    "description": "Sierra multifunción",           "price": 45.30, "productTypeId": allTypes[1].id },
      { "sku": "PROD-10", "name": "Broca 10mm",        "description": "Broca alta velocidad",          "price": 2.50,  "productTypeId": allTypes[1].id },
      { "sku": "PROD-11", "name": "Cinta métrica",     "description": "Métrica 5m",                    "price": 5.75,  "productTypeId": allTypes[2].id },
      { "sku": "PROD-12", "name": "Nivel de burbuja",  "description": "Nivel 60cm",                    "price": 12.00, "productTypeId": allTypes[0].id },
      { "sku": "PROD-13", "name": "Llave fija 14mm",   "description": "Acero forjado",                 "price": 8.90,  "productTypeId": allTypes[1].id },
      { "sku": "PROD-14", "name": "Guantes de cuero",  "description": "Protección industrial",         "price": 9.50,  "productTypeId": allTypes[2].id },
      { "sku": "PROD-15", "name": "Cepillo de alambre", "description": "Acero inoxidable",              "price": 6.30,  "productTypeId": allTypes[2].id },
      { "sku": "PROD-16", "name": "Pistola de silicona","description": "Eléctrica 100W",                "price": 25.00, "productTypeId": allTypes[0].id },
      { "sku": "PROD-17", "name": "Cúter",             "description": "Cúter retráctil",               "price": 3.20,  "productTypeId": allTypes[1].id },
      { "sku": "PROD-18", "name": "Brocha 2\"",        "description": "Brocha sintética",              "price": 4.80,  "productTypeId": allTypes[2].id },
      { "sku": "PROD-19", "name": "Tenazas",           "description": "Tenazas de corte",              "price": 14.40, "productTypeId": allTypes[0].id },
      { "sku": "PROD-20", "name": "Llave inglesa",     "description": "Ajustable 10\"",                "price": 11.60, "productTypeId": allTypes[1].id },
      { "sku": "PROD-21", "name": "Tijeras de hojalata","description": "Corte fino",                    "price": 13.75, "productTypeId": allTypes[2].id },
      { "sku": "PROD-22", "name": "Martillo demoledor","description": "Demoledor eléctrico",           "price": 320.00,"productTypeId": allTypes[0].id },
      { "sku": "PROD-23", "name": "Adaptador SDS",     "description": "Para taladro percutor",         "price": 5.00,  "productTypeId": allTypes[1].id },
      { "sku": "PROD-24", "name": "Tornillos 3x20mm",  "description": "Paquete x100",                  "price": 2.00,  "productTypeId": allTypes[2].id },
      { "sku": "PROD-25", "name": "Llave de vaso 17mm","description": "Juego de 10 piezas",            "price": 28.90, "productTypeId": allTypes[0].id }
    ];
  for (const p of products) {
    if (await productRepo.findOneBy({ sku: p.sku })) continue;

    const newProd = productRepo.create({
      ...p,
      isActive: true,
      createdBy: adminUser,
      updatedBy: adminUser,
    })
    const saved = await productRepo.save(productRepo.create(newProd));
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

  const docIn = docRepo.create({
    type:      'IN' as const,
    date:      new Date(),
    reference: 'SEED-IN-001',
    notes:     'Ingreso semilla',
    userId:    adminUser.id,
    createdBy: adminUser,
    updatedBy: adminUser,
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
    createdBy: adminUser,
    updatedBy: adminUser,
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
