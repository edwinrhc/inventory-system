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
import { SequenceService } from '../inventory/sequence.service';
import { InventorySequence } from '../inventory/entities/sequence.entity';

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
        role: u.role,
      }),
    );
  }

  console.log('✅ Usuarios seed completos');

  const adminUser = await userRepo.findOneBy({ username: 'admin' });
  // 2) Tipos de Producto

  const typeProductRepo = ds.getRepository(ProductType);
  const types = [
    {
      name: 'Herramientas manuales',
      description: 'Llaves, martillos y cinceles',
    },
    {
      name: 'Herramientas eléctricas',
      description: 'Taladros, sierras y lijadoras',
    },
    { name: 'Accesorios', description: 'Brocas, discos y hojas de sierra' },
    { name: 'Consumibles', description: 'Tornillos, tuercas y arandelas' },
    { name: 'Jardinería', description: 'Tijeras, mangueras y palas' },
    {
      name: 'Pintura y revestimientos',
      description: 'Brochas, rodillos y selladores',
    },
    { name: 'Fontanería', description: 'Tubos, uniones y válvulas' },
    { name: 'Electricidad', description: 'Interruptores, enchufes y cables' },
    { name: 'Carpintería', description: 'Sargentos, cepillos y escuadras' },
    { name: 'Cerrajería', description: 'Candados, cerraduras y bisagras' },
    { name: 'Automoción', description: 'Herramientas para autos y motos' },
    { name: 'Soldadura', description: 'Electrodos, alambres y máscaras' },
    {
      name: 'Maquinaria pesada',
      description: 'Bombas, compresores y generadores',
    },
    { name: 'Iluminación', description: 'Lámparas, tubos y reflectores' },
    { name: 'Seguridad industrial', description: 'Cascos, guantes y gafas' },
    {
      name: 'Adhesivos y selladores',
      description: 'Silicona, pegamentos y masillas',
    },
    {
      name: 'Ferretería industrial',
      description: 'Cadenas, poleas y engranajes',
    },
    {
      name: 'Equipos de medición',
      description: 'Multímetros, calibres y niveles',
    },
    {
      name: 'Calefacción y climatización',
      description: 'Radiadores, ventiladores y termostatos',
    },
    {
      name: 'Refrigeración',
      description: 'Condensadores, compresores y evaporadores',
    },
    {
      name: 'Herramientas neumáticas',
      description: 'Pistolas, compresores y mangueras',
    },
    {
      name: 'Equipos de limpieza',
      description: 'Aspiradoras, hidrolavadoras y mopas',
    },
    {
      name: 'Accesorios de instalación',
      description: 'Tuberías, soportes y abrazaderas',
    },
    { name: 'Protección personal', description: 'Mascotas, tapones y arneses' },
    {
      name: 'Repuestos y recambios',
      description: 'Filtros, juntas y rodamientos',
    },
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
  const allTypes = await typeProductRepo.find();
  const products = [
    {
      sku: 'PROD-1',
      name: 'Broca 10mm A',
      description: 'Broca alta velocidad',
      price: 2.5,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-2',
      name: 'Llave de vaso 17mm A',
      description: 'Juego de 10 piezas',
      price: 28.9,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-3',
      name: 'Adaptador SDS A',
      description: 'Para taladro percutor',
      price: 5.0,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-4',
      name: 'Cepillo de alambre A',
      description: 'Acero inoxidable',
      price: 6.3,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-5',
      name: 'Broca 10mm B',
      description: 'Broca alta velocidad',
      price: 2.5,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-6',
      name: 'Llave inglesa A',
      description: 'Ajustable 10',
      price: 11.6,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-7',
      name: 'Cepillo de alambre B',
      description: 'Acero inoxidable',
      price: 6.3,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-8',
      name: 'Broca 10mm C',
      description: 'Broca alta velocidad',
      price: 2.5,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-9',
      name: 'Martillo demoledor A',
      description: 'Demoledor eléctrico',
      price: 320.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-10',
      name: 'Tornillos 3x20mm A',
      description: 'Paquete x100',
      price: 2.0,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-11',
      name: 'Cincel A',
      description: 'Cincel para concreto',
      price: 18.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-12',
      name: 'Broca 10mm D',
      description: 'Broca alta velocidad',
      price: 2.5,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-13',
      name: 'Cepillo de alambre C',
      description: 'Acero inoxidable',
      price: 6.3,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-14',
      name: "Brocha 2' A",
      description: 'Brocha sintética',
      price: 4.8,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-15',
      name: 'Atornillador A',
      description: 'Makita inalámbrico',
      price: 350.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-16',
      name: 'Llave fija 14mm A',
      description: 'Acero forjado',
      price: 8.9,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-17',
      name: 'Cincel B',
      description: 'Cincel para concreto',
      price: 18.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-18',
      name: 'Cincel C',
      description: 'Cincel para concreto',
      price: 18.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-19',
      name: 'Broca 10mm E',
      description: 'Broca alta velocidad',
      price: 2.5,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-20',
      name: 'Taladro Percutor A',
      description: 'Bosh',
      price: 237.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-21',
      name: 'Martillo demoledor B',
      description: 'Demoledor eléctrico',
      price: 320.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-22',
      name: 'Martillo demoledor C',
      description: 'Demoledor eléctrico',
      price: 320.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-23',
      name: 'Broca 10mm F',
      description: 'Broca alta velocidad',
      price: 2.5,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-24',
      name: 'Tornillos 3x20mm B',
      description: 'Paquete x100',
      price: 2.0,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-25',
      name: 'Adaptador SDS B',
      description: 'Para taladro percutor',
      price: 5.0,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-26',
      name: 'Lijadora A',
      description: 'De disco',
      price: 150.0,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-27',
      name: 'Cinta métrica A',
      description: 'Métrica 5m',
      price: 5.75,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-28',
      name: 'Atornillador B',
      description: 'Makita inalámbrico',
      price: 350.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-29',
      name: 'Guantes de cuero A',
      description: 'Protección industrial',
      price: 9.5,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-30',
      name: 'Adaptador SDS C',
      description: 'Para taladro percutor',
      price: 5.0,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-31',
      name: 'Pistola de silicona A',
      description: 'Eléctrica 100W',
      price: 25.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-32',
      name: 'Llave inglesa B',
      description: "Ajustable 10'",
      price: 11.6,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-33',
      name: 'Adaptador SDS D',
      description: 'Para taladro percutor',
      price: 5.0,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-34',
      name: 'Tijeras de hojalata A',
      description: 'Corte fino',
      price: 13.75,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-35',
      name: 'Nivel de burbuja A',
      description: 'Nivel 60cm',
      price: 12.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-36',
      name: 'Llave fija 14mm B',
      description: 'Acero forjado',
      price: 8.9,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-37',
      name: 'Cúter A',
      description: 'Cúter retráctil',
      price: 3.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-38',
      name: 'Adaptador SDS E',
      description: 'Para taladro percutor',
      price: 5.0,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-39',
      name: 'Llave inglesa C',
      description: "Ajustable 10'",
      price: 11.6,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-40',
      name: 'Llave inglesa D',
      description: "Ajustable 10'",
      price: 11.6,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-41',
      name: 'Cepillo de alambre D',
      description: 'Acero inoxidable',
      price: 6.3,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-42',
      name: 'Adaptador SDS F',
      description: 'Para taladro percutor',
      price: 5.0,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-43',
      name: 'Tijeras de hojalata B',
      description: 'Corte fino',
      price: 13.75,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-44',
      name: "Brocha 2' B",
      description: 'Brocha sintética',
      price: 4.8,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-45',
      name: 'Llave de vaso 17mm B',
      description: 'Juego de 10 piezas',
      price: 28.9,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-46',
      name: 'Alicate A',
      description: 'Bosh #4',
      price: 27.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-47',
      name: 'Martillo A',
      description: 'Martillo de acero',
      price: 15.75,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-48',
      name: 'Adaptador SDS G',
      description: 'Para taladro percutor',
      price: 5.0,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-49',
      name: 'Llave de vaso 17mm C',
      description: 'Juego de 10 piezas',
      price: 28.9,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-50',
      name: 'Martillo demoledor D',
      description: 'Demoledor eléctrico',
      price: 320.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-51',
      name: 'Tenazas A',
      description: 'Tenazas de corte',
      price: 14.4,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-52',
      name: 'Cúter B',
      description: 'Cúter retráctil',
      price: 3.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-53',
      name: 'Tenazas B',
      description: 'Tenazas de corte',
      price: 14.4,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-54',
      name: 'Llave de vaso 17mm D',
      description: 'Juego de 10 piezas',
      price: 28.9,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-55',
      name: 'Adaptador SDS H',
      description: 'Para taladro percutor',
      price: 5.0,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-56',
      name: 'Cinta métrica B',
      description: 'Métrica 5m',
      price: 5.75,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-57',
      name: 'Martillo B',
      description: 'Martillo de acero',
      price: 15.75,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-58',
      name: 'Guantes de cuero B',
      description: 'Protección industrial',
      price: 9.5,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-59',
      name: "Brocha 2' C",
      description: 'Brocha sintética',
      price: 4.8,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-60',
      name: 'Cúter C',
      description: 'Cúter retráctil',
      price: 3.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-61',
      name: 'Martillo demoledor E',
      description: 'Demoledor eléctrico',
      price: 320.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-62',
      name: 'Tenazas C',
      description: 'Tenazas de corte',
      price: 14.4,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-63',
      name: 'Sierra de mano A',
      description: 'Sierra multifunción',
      price: 45.3,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-64',
      name: 'Alicate B',
      description: 'Bosh #4',
      price: 27.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-65',
      name: 'Llave fija 14mm C',
      description: 'Acero forjado',
      price: 8.9,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-66',
      name: 'Cincel D',
      description: 'Cincel para concreto',
      price: 18.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-67',
      name: 'Pistola de silicona B',
      description: 'Eléctrica 100W',
      price: 25.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-68',
      name: 'Llave de carraca A',
      description: "1/2'mango antideslizante",
      price: 22.5,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-69',
      name: 'Cincel E',
      description: 'Cincel para concreto',
      price: 18.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-70',
      name: "Brocha 2' D",
      description: 'Brocha sintética',
      price: 4.8,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-71',
      name: 'Tijeras de hojalata C',
      description: 'Corte fino',
      price: 13.75,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-72',
      name: 'Taladro Percutor B',
      description: 'Bosh',
      price: 237.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-73',
      name: 'Cincel F',
      description: 'Cincel para concreto',
      price: 18.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-74',
      name: 'Tenazas D',
      description: 'Tenazas de corte',
      price: 14.4,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-75',
      name: 'Llave fija 14mm D',
      description: 'Acero forjado',
      price: 8.9,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-76',
      name: 'Pistola de silicona C',
      description: 'Eléctrica 100W',
      price: 25.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-77',
      name: 'Alicate C',
      description: 'Bosh #4',
      price: 27.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-78',
      name: "Brocha 2' E",
      description: 'Brocha sintética',
      price: 4.8,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-79',
      name: 'Cinta métrica C',
      description: 'Métrica 5m',
      price: 5.75,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-80',
      name: 'Tornillos 3x20mm C',
      description: 'Paquete x100',
      price: 2.0,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-81',
      name: 'Lijadora B',
      description: 'De disco',
      price: 150.0,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-82',
      name: 'Cinta métrica D',
      description: 'Métrica 5m',
      price: 5.75,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-83',
      name: 'Llave inglesa E',
      description: "Ajustable 10'",
      price: 11.6,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-84',
      name: 'Llave inglesa F',
      description: "Ajustable 10'",
      price: 11.6,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-85',
      name: 'Llave de carraca B',
      description: "1/2' mango antideslizante",
      price: 22.5,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-86',
      name: 'Llave inglesa G',
      description: "Ajustable 10'",
      price: 11.6,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-87',
      name: 'Alicate D',
      description: 'Bosh #4',
      price: 27.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-88',
      name: 'Tijeras de hojalata D',
      description: 'Corte fino',
      price: 13.75,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-89',
      name: 'Broca 10mm G',
      description: 'Broca alta velocidad',
      price: 2.5,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-90',
      name: 'Lijadora C',
      description: 'De disco',
      price: 150.0,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-91',
      name: 'Lijadora D',
      description: 'De disco',
      price: 150.0,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-92',
      name: 'Atornillador C',
      description: 'Makita inalámbrico',
      price: 350.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-93',
      name: 'Llave inglesa H',
      description: "Ajustable 10'",
      price: 11.6,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-94',
      name: 'Tornillos 3x20mm D',
      description: 'Paquete x100',
      price: 2.0,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-95',
      name: 'Llave inglesa I',
      description: "Ajustable 10'",
      price: 11.6,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-96',
      name: 'Llave de vaso 17mm E',
      description: 'Juego de 10 piezas',
      price: 28.9,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-97',
      name: 'Cúter D',
      description: 'Cúter retráctil',
      price: 3.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-98',
      name: 'Pistola de silicona D',
      description: 'Eléctrica 100W',
      price: 25.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-99',
      name: 'Cincel G',
      description: 'Cincel para concreto',
      price: 18.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-100',
      name: 'Cúter E',
      description: 'Cúter retráctil',
      price: 3.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-101',
      name: 'Llave de carraca C',
      description: "1/2' mango antideslizante",
      price: 22.5,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-102',
      name: 'Broca 10mm H',
      description: 'Broca alta velocidad',
      price: 2.5,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-103',
      name: 'Llave de vaso 17mm F',
      description: 'Juego de 10 piezas',
      price: 28.9,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-104',
      name: 'Llave fija 14mm E',
      description: 'Acero forjado',
      price: 8.9,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-105',
      name: "Brocha 2' F",
      description: 'Brocha sintética',
      price: 4.8,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-106',
      name: 'Cúter F',
      description: 'Cúter retráctil',
      price: 3.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-107',
      name: 'Nivel de burbuja B',
      description: 'Nivel 60cm',
      price: 12.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-108',
      name: 'Llave fija 14mm F',
      description: 'Acero forjado',
      price: 8.9,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-109',
      name: 'Martillo demoledor F',
      description: 'Demoledor eléctrico',
      price: 320.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-110',
      name: 'Pistola de silicona E',
      description: 'Eléctrica 100W',
      price: 25.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-111',
      name: 'Tenazas E',
      description: 'Tenazas de corte',
      price: 14.4,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-112',
      name: "Brocha 2' G",
      description: 'Brocha sintética',
      price: 4.8,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-113',
      name: 'Atornillador D',
      description: 'Makita inalámbrico',
      price: 350.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-114',
      name: 'Martillo C',
      description: 'Martillo de acero',
      price: 15.75,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-115',
      name: 'Atornillador E',
      description: 'Makita inalámbrico',
      price: 350.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-116',
      name: 'Nivel de burbuja C',
      description: 'Nivel 60cm',
      price: 12.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-117',
      name: 'Llave de vaso 17mm G',
      description: 'Juego de 10 piezas',
      price: 28.9,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-118',
      name: 'Atornillador F',
      description: 'Makita inalámbrico',
      price: 350.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-119',
      name: 'Sierra de mano B',
      description: 'Sierra multifunción',
      price: 45.3,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-120',
      name: 'Cepillo de alambre E',
      description: 'Acero inoxidable',
      price: 6.3,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-121',
      name: 'Tijeras de hojalata E',
      description: 'Corte fino',
      price: 13.75,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-122',
      name: 'Llave fija 14mm G',
      description: 'Acero forjado',
      price: 8.9,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-123',
      name: 'Taladro Percutor C',
      description: 'Bosh',
      price: 237.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-124',
      name: 'Llave de vaso 17mm H',
      description: 'Juego de 10 piezas',
      price: 28.9,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-125',
      name: 'Llave inglesa J',
      description: "Ajustable 10'",
      price: 11.6,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-126',
      name: 'Pistola de silicona F',
      description: 'Eléctrica 100W',
      price: 25.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-127',
      name: 'Martillo demoledor G',
      description: 'Demoledor eléctrico',
      price: 320.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-128',
      name: 'Cúter G',
      description: 'Cúter retráctil',
      price: 3.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-129',
      name: 'Lijadora E',
      description: 'De disco',
      price: 150.0,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-130',
      name: 'Martillo D',
      description: 'Martillo de acero',
      price: 15.75,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-131',
      name: 'Llave de vaso 17mm I',
      description: 'Juego de 10 piezas',
      price: 28.9,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-132',
      name: 'Tenazas F',
      description: 'Tenazas de corte',
      price: 14.4,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-133',
      name: 'Broca 10mm I',
      description: 'Broca alta velocidad',
      price: 2.5,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-134',
      name: 'Llave de vaso 17mm J',
      description: 'Juego de 10 piezas',
      price: 28.9,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-135',
      name: 'Guantes de cuero C',
      description: 'Protección industrial',
      price: 9.5,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-136',
      name: 'Adaptador SDS I',
      description: 'Para taladro percutor',
      price: 5.0,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-137',
      name: 'Tenazas G',
      description: 'Tenazas de corte',
      price: 14.4,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-138',
      name: 'Martillo E',
      description: 'Martillo de acero',
      price: 15.75,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-139',
      name: 'Cepillo de alambre F',
      description: 'Acero inoxidable',
      price: 6.3,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-140',
      name: 'Tornillos 3x20mm E',
      description: 'Paquete x100',
      price: 2.0,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-141',
      name: 'Destornillador A',
      description: 'Phillips #2',
      price: 7.2,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-142',
      name: 'Destornillador B',
      description: 'Phillips #2',
      price: 7.2,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-143',
      name: 'Adaptador SDS J',
      description: 'Para taladro percutor',
      price: 5.0,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-144',
      name: 'Cincel H',
      description: 'Cincel para concreto',
      price: 18.0,
      productTypeId: allTypes[0].id,
    },
    {
      sku: 'PROD-145',
      name: 'Cinta métrica E',
      description: 'Métrica 5m',
      price: 5.75,
      productTypeId: allTypes[2].id,
    },
    {
      sku: 'PROD-146',
      name: 'Llave inglesa K',
      description: "Ajustable 10'",
      price: 11.6,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-147',
      name: 'Alicate E',
      description: 'Bosh #4',
      price: 27.2,
      productTypeId: allTypes[1].id,
    },
    {
      sku: 'PROD-148',
      name: 'Martillo F',
      description: 'Martillo de acero',
      price: 15.75,
      productTypeId: allTypes[0].id,
    },
  ];
  for (const p of products) {
    if (await productRepo.findOneBy({ sku: p.sku })) continue;

    const newProd = productRepo.create({
      ...p,
      isActive: true,
      createdBy: adminUser,
      updatedBy: adminUser,
    });
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
  const docRepo = ds.getRepository(InventoryDocument);
  const lineRepo = ds.getRepository(InventoryLine);

  const sequenceSvc = new SequenceService(ds.getRepository(InventorySequence));
  const nextRefIn = await sequenceSvc.next('IN');
  // 5.1) Creamos una guía de ingreso con 2 líneas

  const docIn = docRepo.create({
    type: 'IN' as const,
    date: new Date(),
    reference: nextRefIn,
    notes: 'Ingreso semilla',
    userId: adminUser.id,
    createdBy: adminUser,
    updatedBy: adminUser,
    lines: [
      {
        productId: allProducts[0].id,
        quantity: 5,
        unitPrice: 15.75,
        detail: 'Lote A',
      },
      {
        productId: allProducts[1].id,
        quantity: 3,
        unitPrice: 7.2,
        detail: 'Lote B',
      },
    ],
  });
  await docRepo.save(docIn);
  console.log(`✅ Documento IN creado: ${docIn.id}`);

  // 5.2) Creamos una guía de salida con 1 línea
  const nextRefOut = await sequenceSvc.next('OUT');
  const docOut = docRepo.create({
    type: 'OUT' as const,
    date: new Date(),
    reference: nextRefOut,
    notes: 'Salida semilla',
    userId: adminUser.id,
    createdBy: adminUser,
    updatedBy: adminUser,
    lines: [{ productId: allProducts[2].id, quantity: 2, detail: 'Para demo' }],
  });
  await docRepo.save(docOut);
  console.log(`✅ Documento OUT creado: ${docOut.id}`);

  // 5.3) Ajustamos el stock manualmente para reflejar estos movimientos
  await Promise.all(
    docIn.lines.map((line) =>
      inventoryRepo.increment(
        { productId: line.productId },
        'quantity',
        line.quantity,
      ),
    ),
  );
  await Promise.all(
    docOut.lines.map((line) =>
      inventoryRepo.decrement(
        { productId: line.productId },
        'quantity',
        line.quantity,
      ),
    ),
  );
  console.log('✅ Ajuste de stock por documentos completo');

  await ds.destroy();
  console.log('Seed completo');
}

runSeeds().catch((e) => {
  console.error('❌ Error en seed:', e);
  process.exit(1);
});
