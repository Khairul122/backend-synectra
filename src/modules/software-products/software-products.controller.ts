import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { SoftwareProductsService } from './software-products.service';
import { CreateSoftwareProductDto } from './dto/create-software-product.dto';
import { UpdateSoftwareProductDto } from './dto/update-software-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('software-products')
@Controller('software-products')
export class SoftwareProductsController {
  constructor(private readonly softwareProductsService: SoftwareProductsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ambil semua software (Admin only)' })
  @ApiResponse({ status: 200, description: 'Daftar semua software' })
  findAll() {
    return this.softwareProductsService.findAll();
  }

  @Get('public')
  @ApiOperation({ summary: 'Ambil software aktif (Public)' })
  @ApiResponse({ status: 200, description: 'Daftar software aktif' })
  findAllActive() {
    return this.softwareProductsService.findAllActive();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ambil satu software berdasarkan ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Data software' })
  @ApiResponse({ status: 404, description: 'Software tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.softwareProductsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah software baru (Admin only)' })
  @ApiResponse({ status: 201, description: 'Software berhasil ditambahkan' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  create(@Body() dto: CreateSoftwareProductDto) {
    return this.softwareProductsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update software (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Software berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Software tidak ditemukan' })
  update(@Param('id') id: string, @Body() dto: UpdateSoftwareProductDto) {
    return this.softwareProductsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus software (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Software berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Software tidak ditemukan' })
  remove(@Param('id') id: string) {
    return this.softwareProductsService.delete(id);
  }
}
