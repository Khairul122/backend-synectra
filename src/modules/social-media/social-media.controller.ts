import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiCookieAuth, ApiParam,
} from '@nestjs/swagger';
import { SocialMediaService } from './social-media.service';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('social-media')
@Controller('social-media')
export class SocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil semua sosial media' })
  @ApiResponse({ status: 200, description: 'Daftar semua sosial media' })
  findAll() {
    return this.socialMediaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil satu sosial media berdasarkan ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Data sosial media' })
  @ApiResponse({ status: 404, description: 'Sosial media tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.socialMediaService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat sosial media baru (Admin only)' })
  @ApiResponse({ status: 201, description: 'Sosial media berhasil dibuat' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  create(@Body() dto: CreateSocialMediaDto) {
    return this.socialMediaService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update sosial media (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Sosial media berhasil diupdate' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  @ApiResponse({ status: 404, description: 'Sosial media tidak ditemukan' })
  update(@Param('id') id: string, @Body() dto: UpdateSocialMediaDto) {
    return this.socialMediaService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus sosial media (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Sosial media berhasil dihapus' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  @ApiResponse({ status: 404, description: 'Sosial media tidak ditemukan' })
  remove(@Param('id') id: string) {
    return this.socialMediaService.delete(id);
  }
}
