import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { ProgressReportsService } from './progress-reports.service';
import { CreateProgressReportDto } from './dto/create-progress-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('progress-reports')
@Controller('progress-reports')
export class ProgressReportsController {
  constructor(private readonly progressReportsService: ProgressReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah update progress (Admin only)' })
  @ApiResponse({ status: 201, description: 'Progress berhasil ditambahkan' })
  create(@Body() dto: CreateProgressReportDto) {
    return this.progressReportsService.create(dto);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ambil timeline progress suatu order' })
  @ApiParam({ name: 'orderId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Timeline progress' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.progressReportsService.findByOrder(orderId);
  }
}
