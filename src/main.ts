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
let app: INestApplication;

export const setupApp = async (nestApp: INestApplication) => {
  // Global Prefix
  nestApp.setGlobalPrefix('api');

  // Global Validation Pipe
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Filter & Interceptor
  nestApp.useGlobalFilters(new HttpExceptionFilter());
  nestApp.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('Synectra API')
    .setDescription('Dokumentasi API untuk platform Synectra')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(nestApp, config);
  SwaggerModule.setup('docs', nestApp, document);
};

async function bootstrap() {
  if (!app) {
    const logger = new Logger('Bootstrap');
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    await setupApp(app);
    
    if (process.env.NODE_ENV !== 'production') {
      const port = process.env.PORT || 3000;
      await app.listen(port);
      logger.log(`Aplikasi berjalan di: http://localhost:${port}/api`);
      logger.log(`Dokumentasi Swagger: http://localhost:${port}/api/docs`);
    } else {
      await app.init();
    }
  }
  return server;
}

// In production (Vercel), we export a handler that ensures the app is bootstrapped
export default async (req: any, res: any) => {
  await bootstrap();
  server(req, res);
};

// For local development, still call bootstrap
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}
