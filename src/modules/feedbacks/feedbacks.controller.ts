import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('feedbacks')
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Get('public')
  @ApiOperation({ summary: 'Ambil semua feedback untuk landing page (publik)' })
  @ApiResponse({ status: 200, description: 'Daftar feedback' })
  findPublic() {
    return this.feedbacksService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit feedback baru (publik, tanpa auth)' })
  @ApiResponse({ status: 201, description: 'Feedback berhasil dikirim' })
  create(@Body() dto: CreateFeedbackDto) {
    return this.feedbacksService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ambil semua feedback (Admin only)' })
  @ApiResponse({ status: 200, description: 'Daftar feedback' })
  findAll() {
    return this.feedbacksService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ambil feedback by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Detail feedback' })
  @ApiResponse({ status: 404, description: 'Feedback tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.feedbacksService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update feedback (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Feedback berhasil diupdate' })
  update(@Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
    return this.feedbacksService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus feedback (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Feedback berhasil dihapus' })
  remove(@Param('id') id: string) {
    return this.feedbacksService.remove(id);
  }
}
