import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express from 'express';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// Create a singleton instance of the express server
const server = express();
let app: INestApplication;

export const setupApp = async (nestApp: INestApplication) => {
  nestApp.use(cookieParser());

  nestApp.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  nestApp.setGlobalPrefix('api');

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  nestApp.useGlobalFilters(new HttpExceptionFilter());
  nestApp.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Synectra API')
    .setDescription('Dokumentasi API untuk platform Synectra')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(nestApp, config);
  SwaggerModule.setup('api/docs', nestApp, document, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js',
    ],
  });
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
