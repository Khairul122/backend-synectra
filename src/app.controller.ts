import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Info Synectra API — daftar endpoint yang tersedia' })
  @ApiResponse({ status: 200, description: 'Berhasil mengembalikan info API' })
  getApiInfo(): object {
    return this.appService.getApiInfo();
  }
}
