import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiCookieAuth, ApiParam,
} from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil semua portfolio' })
  @ApiResponse({ status: 200, description: 'Daftar portfolio' })
  findAll() {
    return this.portfolioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil satu portfolio berdasarkan ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Data portfolio' })
  @ApiResponse({ status: 404, description: 'Portfolio tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.portfolioService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat portfolio baru (Admin)' })
  @ApiResponse({ status: 201, description: 'Portfolio berhasil dibuat' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — bukan admin' })
  create(@Body() dto: CreatePortfolioDto) {
    return this.portfolioService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update portfolio (Admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Portfolio berhasil diupdate' })
  @ApiResponse({ status: 403, description: 'Forbidden — bukan admin' })
  @ApiResponse({ status: 404, description: 'Portfolio tidak ditemukan' })
  update(@Param('id') id: string, @Body() dto: UpdatePortfolioDto) {
    return this.portfolioService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus portfolio (Admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Portfolio berhasil dihapus' })
  @ApiResponse({ status: 403, description: 'Forbidden — bukan admin' })
  @ApiResponse({ status: 404, description: 'Portfolio tidak ditemukan' })
  remove(@Param('id') id: string) {
    return this.portfolioService.delete(id);
  }
}
