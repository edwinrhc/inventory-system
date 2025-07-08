import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  // Validación global: whitelist, forbidir campos extra, transformar payloads a instancias de DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );


  // Prefijo global para versionado de la API
  app.setGlobalPrefix('api/v1');        // si lo usas
  app.enableCors();


  // Configuración de Swagger global
  const config = new DocumentBuilder()
    .setTitle('Inventory System')
    .setDescription('The Inventory System API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(3000);
}
bootstrap();
