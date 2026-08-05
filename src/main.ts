import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Intercepteur global pour formater les réponses
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Gestion globale des erreurs HTTP
  app.useGlobalFilters(new HttpExceptionFilter());

  // Validation automatique des DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Deukway API')
    .setDescription('API de recherche de logements')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `🚀 API: http://localhost:${process.env.PORT ?? 3000}`,
  );

  console.log(
    `📚 Swagger: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );
}

bootstrap();