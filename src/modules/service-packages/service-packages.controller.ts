import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiCookieAuth, ApiParam,
} from '@nestjs/swagger';
import { ServicePackagesService } from './service-packages.service';
import { CreateServicePackageDto } from './dto/create-service-package.dto';
import { UpdateServicePackageDto } from './dto/update-service-package.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('service-packages')
@Controller('service-packages')
export class ServicePackagesController {
  constructor(private readonly servicePackagesService: ServicePackagesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ambil semua paket layanan (Admin only)' })
  @ApiResponse({ status: 200, description: 'Daftar semua paket layanan' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  findAll() {
    return this.servicePackagesService.findAll();
  }

  @Get('public')
  @ApiOperation({ summary: 'Ambil paket layanan aktif (Public — untuk landing page)' })
  @ApiResponse({ status: 200, description: 'Daftar paket layanan aktif' })
  findAllActive() {
    return this.servicePackagesService.findAllActive();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ambil satu paket layanan berdasarkan ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Data paket layanan' })
  @ApiResponse({ status: 404, description: 'Paket tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.servicePackagesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat paket layanan baru (Admin only)' })
  @ApiResponse({ status: 201, description: 'Paket layanan berhasil dibuat' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  create(@Body() dto: CreateServicePackageDto) {
    return this.servicePackagesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update paket layanan (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Paket layanan berhasil diupdate' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  @ApiResponse({ status: 404, description: 'Paket tidak ditemukan' })
  update(@Param('id') id: string, @Body() dto: UpdateServicePackageDto) {
    return this.servicePackagesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus paket layanan (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Paket layanan berhasil dihapus' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  @ApiResponse({ status: 404, description: 'Paket tidak ditemukan' })
  remove(@Param('id') id: string) {
    return this.servicePackagesService.delete(id);
  }
}
