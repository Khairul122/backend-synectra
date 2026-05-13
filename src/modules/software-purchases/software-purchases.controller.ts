import { Controller, Get, Post, Patch, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { SoftwarePurchasesService } from './software-purchases.service';
import { CreateSoftwarePurchaseDto } from './dto/create-software-purchase.dto';
import { UploadReceiptDto } from './dto/upload-receipt.dto';
import { RejectPurchaseDto } from './dto/reject-purchase.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../types/auth.types';

@ApiTags('software-purchases')
@Controller('software-purchases')
export class SoftwarePurchasesController {
  constructor(private readonly softwarePurchasesService: SoftwarePurchasesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ambil pembelian software — admin: semua, client: milik sendiri' })
  @ApiResponse({ status: 200, description: 'Daftar pembelian software' })
  findAll(@CurrentUser() user: AuthUser) {
    if (user.role === 'admin') return this.softwarePurchasesService.findAll();
    return this.softwarePurchasesService.findByClient(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Beli software baru' })
  @ApiResponse({ status: 201, description: 'Pembelian berhasil dibuat' })
  @ApiResponse({ status: 404, description: 'Software tidak ditemukan atau tidak aktif' })
  create(@Body() dto: CreateSoftwarePurchaseDto, @CurrentUser() user: AuthUser) {
    return this.softwarePurchasesService.create(dto, user.id);
  }

  @Patch(':id/receipt')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Upload bukti bayar' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Bukti bayar berhasil diupload' })
  @ApiResponse({ status: 403, description: 'Bukan pembelian Anda' })
  uploadReceipt(@Param('id') id: string, @Body() dto: UploadReceiptDto, @CurrentUser() user: AuthUser) {
    return this.softwarePurchasesService.uploadReceipt(id, dto, user.id);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Verifikasi pembelian (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Pembelian terverifikasi' })
  verify(@Param('id') id: string) {
    return this.softwarePurchasesService.verify(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Tolak pembelian dengan catatan (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Pembelian ditolak' })
  reject(@Param('id') id: string, @Body() dto: RejectPurchaseDto) {
    return this.softwarePurchasesService.reject(id, dto);
  }
}
