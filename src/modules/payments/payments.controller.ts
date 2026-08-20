import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import type { AuthUser } from '../../types/auth.types';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('income')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Rekap pemasukan dari pembayaran terverifikasi (Admin only)' })
  @ApiResponse({ status: 200, description: 'Data pemasukan berhasil diambil' })
  getIncome(
    @Query('view')  view?: string,
    @Query('year')  year?: string,
    @Query('month') month?: string,
  ) {
    return this.paymentsService.getIncome(
      view ?? 'monthly',
      year  ? parseInt(year,  10) : undefined,
      month ? parseInt(month, 10) : undefined,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload bukti pembayaran (Client)' })
  @ApiResponse({ status: 201, description: 'Payment berhasil dibuat' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik order' })
  @ApiResponse({ status: 404, description: 'Order tidak ditemukan' })
  create(@Body() dto: CreatePaymentDto, @Req() req: Request) {
    const user = req.user as AuthUser;
    return this.paymentsService.create(dto, user);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Verifikasi pembayaran (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Payment terverifikasi' })
  verify(@Param('id') id: string) {
    return this.paymentsService.verify(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Tolak pembayaran (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Payment ditolak' })
  reject(@Param('id') id: string, @Body() dto: RejectPaymentDto) {
    return this.paymentsService.reject(id, dto);
  }
}
