import { Controller, Patch, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiCookieAuth('access_token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password user oleh admin' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Password berhasil direset' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  async resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    await this.usersService.resetPassword(id, dto.newPassword);
    return { message: 'Password berhasil direset' };
  }
}
