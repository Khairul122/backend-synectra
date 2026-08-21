import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo(): object {
    // Hanya info minimal untuk health-check — tidak membocorkan peta endpoint/route internal
    return {
      name: 'Synectra API',
      status: 'online',
      timestamp: new Date().toISOString(),
    };
  }
}
