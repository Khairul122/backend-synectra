import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSignatureDto } from './dto/update-signature.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('signature')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ambil URL tanda tangan perusahaan' })
  @ApiResponse({ status: 200, description: 'URL tanda tangan perusahaan (bisa null jika belum diset)' })
  getCompanySignature() {
    return this.settingsService.getCompanySignature();
  }

  @Patch('signature')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update tanda tangan perusahaan (Admin only)' })
  @ApiResponse({ status: 200, description: 'Tanda tangan perusahaan berhasil diupdate' })
  updateCompanySignature(@Body() dto: UpdateSignatureDto) {
    return this.settingsService.updateCompanySignature(dto);
  }
}
