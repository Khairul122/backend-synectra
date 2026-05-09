import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

// Create a singleton instance of the express server
const server = express();

export const setupApp = async (app: INestApplication) => {
  // Global Prefix
  app.setGlobalPrefix('api');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Filter & Interceptor
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('Synectra API')
    .setDescription('Dokumentasi API untuk platform Synectra')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
};

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  
  await setupApp(app);
  
  // For Vercel, we only call init()
  // For local development, we call listen()
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Aplikasi berjalan di: http://localhost:${port}/api`);
    logger.log(`Dokumentasi Swagger: http://localhost:${port}/api/docs`);
  } else {
    await app.init();
  }
}

// Bootstrap the app
bootstrap();

// Export the express server for Vercel
export default server;
