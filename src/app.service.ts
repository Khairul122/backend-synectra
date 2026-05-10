import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo(): object {
    return {
      name: 'Synectra API',
      description: 'Platform untuk kebutuhan penerimaan client',
      version: '1.0.0',
      status: 'online',
      timestamp: new Date().toISOString(),
      docs: '/api/docs',
      endpoints: {
        auth: {
          register:        'POST /api/auth/register',
          login:           'POST /api/auth/login',
          loginWithGoogle: 'GET  /api/auth/google',
          me:              'GET  /api/auth/me',
          logout:          'POST /api/auth/logout',
        },
        clients: {
          list:   'GET    /api/clients',
          create: 'POST   /api/clients',
          detail: 'GET    /api/clients/:id',
          update: 'PATCH  /api/clients/:id',
          delete: 'DELETE /api/clients/:id',
        },
      },
    };
  }
}
