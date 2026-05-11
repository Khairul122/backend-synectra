import { Controller, Post, Patch, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload bukti pembayaran (Client)' })
  @ApiResponse({ status: 201, description: 'Payment berhasil dibuat' })
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
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
