import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check — status API' })
  @ApiResponse({ status: 200, description: 'API online' })
  getApiInfo(): object {
    return this.appService.getApiInfo();
  }
}
