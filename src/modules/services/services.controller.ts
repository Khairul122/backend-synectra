import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ambil semua layanan (Admin only)' })
  @ApiResponse({ status: 200, description: 'Daftar semua layanan' })
  findAll() {
    return this.servicesService.findAll();
  }

  @Get('public')
  @ApiOperation({ summary: 'Ambil layanan aktif (Public)' })
  @ApiResponse({ status: 200, description: 'Daftar layanan aktif' })
  findAllActive() {
    return this.servicesService.findAllActive();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ambil satu layanan berdasarkan ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Data layanan' })
  @ApiResponse({ status: 404, description: 'Layanan tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah layanan baru (Admin only)' })
  @ApiResponse({ status: 201, description: 'Layanan berhasil ditambahkan' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update layanan (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Layanan berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Layanan tidak ditemukan' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus layanan (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Layanan berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Layanan tidak ditemukan' })
  remove(@Param('id') id: string) {
    return this.servicesService.delete(id);
  }
}
