import { Controller, Get, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiCookieAuth('access_token')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil semua client (Admin only)' })
  @ApiResponse({ status: 200, description: 'Daftar client' })
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail client (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Data client' })
  @ApiResponse({ status: 404, description: 'Client tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data client (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Client berhasil diupdate' })
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus client (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Client berhasil dihapus' })
  remove(@Param('id') id: string) {
    return this.clientsService.delete(id);
  }
}
