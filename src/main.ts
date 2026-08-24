import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

const server = express();
let app: INestApplication;

// Di belakang proxy Vercel: baca IP asli klien dari x-forwarded-for
// agar rate limiting (throttler) menghitung per klien, bukan per proxy
server.set('trust proxy', 1);

// Security headers; CSP dinonaktifkan di dev karena Swagger UI load asset dari cdnjs
server.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production' ? undefined : false,
  }),
);

// CORS whitelist: hanya frontend resmi + localhost dev.
// Request tanpa header Origin (curl, Postman, OAuth redirect) tetap diizinkan.
// maxAge: cache hasil preflight OPTIONS di browser agar tidak berulang setiap request
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://synectra-pi.vercel.app',
  'https://synectra-khairulhudas-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);
server.use(
  cors({
    origin: (origin, cb) =>
      cb(null, !origin || allowedOrigins.includes(origin)),
    credentials: true,
    maxAge: 86400,
  }),
);

// Body webhook GitHub harus tetap raw (bukan hasil parse-ulang JSON) supaya
// verifikasi HMAC signature akurat. Middleware ini didaftarkan sebelum
// body-parser JSON global milik Nest (diregistrasi saat NestFactory.create di
// bawah), jadi hanya route ini yang dapat body sebagai Buffer — route lain
// tidak terpengaruh.
server.use(
  '/api/webhooks/github',
  express.raw({ type: 'application/json', limit: '2mb' }),
);

export const setupApp = async (nestApp: INestApplication) => {
  nestApp.use(cookieParser());

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

  // Swagger hanya di non-production agar skema API tidak terekspos ke publik
  if (process.env.NODE_ENV !== 'production') {
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
  }
};

async function bootstrap() {
  if (!app) {
    const logger = new Logger('Bootstrap');
    app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      cors: false,
    });
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
