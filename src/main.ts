// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Préfixe global de l'API (optionnel mais recommandé)
  app.setGlobalPrefix('api');

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Deukway API')
    .setDescription('Documentation de l’API Deukway')
    .setVersion('1.0')
    .addBearerAuth() // Pour les routes protégées par JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application : http://localhost:${process.env.PORT ?? 3000}/api`);
  console.log(` Swagger : http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}

bootstrap();