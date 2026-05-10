import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express from 'express';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

const server = express();
let app: INestApplication;

// CORS dipasang langsung di Express — header selalu ada meski NestJS error/crash
server.use((req: any, res: any, next: any) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cookie,X-Requested-With');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

export const setupApp = async (nestApp: INestApplication) => {
  nestApp.use(cookieParser());

  nestApp.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  });

  nestApp.setGlobalPrefix('api', { exclude: ['/'] });

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

export default async (req: any, res: any) => {
  await bootstrap();
  server(req, res);
};

if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}
