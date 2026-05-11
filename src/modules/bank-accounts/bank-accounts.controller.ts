import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiCookieAuth, ApiParam,
} from '@nestjs/swagger';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('bank-accounts')
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil semua akun bank' })
  @ApiResponse({ status: 200, description: 'Daftar semua akun bank' })
  findAll() {
    return this.bankAccountsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil satu akun bank berdasarkan ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Data akun bank' })
  @ApiResponse({ status: 404, description: 'Akun bank tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.bankAccountsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat akun bank baru (Admin only)' })
  @ApiResponse({ status: 201, description: 'Akun bank berhasil dibuat' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  create(@Body() dto: CreateBankAccountDto) {
    return this.bankAccountsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update akun bank (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Akun bank berhasil diupdate' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  @ApiResponse({ status: 404, description: 'Akun bank tidak ditemukan' })
  update(@Param('id') id: string, @Body() dto: UpdateBankAccountDto) {
    return this.bankAccountsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus akun bank (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Akun bank berhasil dihapus' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  @ApiResponse({ status: 404, description: 'Akun bank tidak ditemukan' })
  remove(@Param('id') id: string) {
    return this.bankAccountsService.delete(id);
  }
}
