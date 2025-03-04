import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('TODOApp API')
  //.setDescription('The cats API description')
  .setVersion('0.0.1')
  //.addTag('cats')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('swagger', app, document);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })); // O whitelist ignora todos os outros parametros, so entra os que estou pedindo
  await app.listen(3000);
}
bootstrap();
