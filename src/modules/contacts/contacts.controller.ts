import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiCookieAuth, ApiParam,
} from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactChannelDto } from './dto/create-contact-channel.dto';
import { UpdateContactChannelDto } from './dto/update-contact-channel.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil semua kontak channel' })
  @ApiResponse({ status: 200, description: 'Daftar semua kontak' })
  findAll() {
    return this.contactsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil satu kontak berdasarkan ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Data kontak' })
  @ApiResponse({ status: 404, description: 'Kontak tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.contactsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat kontak baru (Admin only)' })
  @ApiResponse({ status: 201, description: 'Kontak berhasil dibuat' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  create(@Body() dto: CreateContactChannelDto) {
    return this.contactsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update kontak (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Kontak berhasil diupdate' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  @ApiResponse({ status: 404, description: 'Kontak tidak ditemukan' })
  update(@Param('id') id: string, @Body() dto: UpdateContactChannelDto) {
    return this.contactsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus kontak (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Kontak berhasil dihapus' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  @ApiResponse({ status: 404, description: 'Kontak tidak ditemukan' })
  remove(@Param('id') id: string) {
    return this.contactsService.delete(id);
  }
}
