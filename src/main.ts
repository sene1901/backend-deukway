import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Intercepteur global
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
  );

  // Gestion globale des erreurs
  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );

  // Validation globale des DTO
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
    .setDescription(
      'API de recherche, location et colocation de logements au Sénégal',
    )
    .setVersion('1.0')
   .addBearerAuth(
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Entrer votre token JWT',
  },
  'access-token',
)
    .build();

  const document = SwaggerModule.createDocument(
    app,
    config,
  );

  SwaggerModule.setup(
    'api/docs',
    app,
    document,
  );

  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  console.log(
    `🚀 API: http://localhost:${port}`,
  );

  console.log(
    `📚 Swagger: http://localhost:${port}/api/docs`,
  );
}

bootstrap();