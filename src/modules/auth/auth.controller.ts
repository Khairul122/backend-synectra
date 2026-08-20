import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto, UserDto } from './dto/auth-response.dto';
import type { AuthUser, GoogleOAuthUser } from '../../types/auth.types';
import { UserModel } from '../../models/user.model';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userModel: UserModel,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrasi akun baru dengan email dan password' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Registrasi berhasil', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { user, accessToken } = await this.authService.register(dto);
    this.setAuthCookie(res, accessToken);
    return { user };
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login dengan email dan password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login berhasil', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Email atau password salah' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { user, accessToken } = await this.authService.loginWithCredentials(dto);
    this.setAuthCookie(res, accessToken);
    return { user };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Login atau registrasi dengan Google OAuth' })
  @ApiResponse({ status: 302, description: 'Redirect ke halaman login Google' })
  googleAuth(): void {
    // Guard menangani redirect ke Google secara otomatis
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback Google OAuth — set JWT cookie lalu redirect ke frontend' })
  @ApiResponse({ status: 302, description: 'Redirect ke dashboard frontend' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async googleAuthCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user, accessToken } = await this.authService.loginWithGoogle(
      req.user as GoogleOAuthUser,
    );
    this.setAuthCookie(res, accessToken);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Token dikirim via URL fragment (#), bukan query string (?) — fragment tidak pernah
    // dikirim ke server (tidak masuk access log / header Referer), hanya bisa dibaca oleh JS di browser.
    res.redirect(`${frontendUrl}/dashboard#_token=${accessToken}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Dapatkan data user yang sedang login' })
  @ApiResponse({ status: 200, description: 'Data user berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Unauthorized — token tidak valid atau expired' })
  async getMe(@CurrentUser() user: AuthUser): Promise<AuthUser & { hasPassword: boolean }> {
    const record = await this.userModel.findByIdWithPassword(user.id);
    return { ...user, hasPassword: !!(record?.passwordHash) };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update profil sendiri' })
  @ApiResponse({ status: 200, description: 'Profil berhasil diupdate' })
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, dto);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ganti password sendiri' })
  @ApiResponse({ status: 200, description: 'Password berhasil diganti' })
  @ApiResponse({ status: 400, description: 'Password saat ini salah atau akun Google' })
  async changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(user.id, dto);
    return { message: 'Password berhasil diperbarui' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Logout dan hapus JWT cookie' })
  @ApiResponse({ status: 200, description: 'Logout berhasil' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    res.clearCookie('access_token');
    return { message: 'Logout berhasil' };
  }

  private setAuthCookie(res: Response, accessToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
