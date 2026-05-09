import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard';
import { AuthResponseDto } from './dto/auth-response.dto';
import type { Request, Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Login dengan Google OAuth' })
  @ApiResponse({ status: 200, description: 'Redirect ke Google Login' })
  async googleAuth(@Req() req: Request) {
    // Guard akan menangani redirect ke Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Berhasil login',
    type: AuthResponseDto,
  })
  async googleAuthRedirect(@Req() req: Request) {
    return this.authService.loginWithGoogle(req.user as any);
  }
}
