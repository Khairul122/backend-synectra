import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserModel } from '../../models/user.model';
import { ClientModel } from '../../models/client.model';
import { AuthUser, GoogleOAuthUser, JwtPayload } from '../../types/auth.types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    private userModel: UserModel,
    private clientModel: ClientModel,
    private jwtService: JwtService,
  ) {}

  /**
   * Registrasi user baru dengan email dan password
   */
  async register(dto: RegisterDto): Promise<{ user: AuthUser; accessToken: string }> {
    const existing = await this.userModel.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    try {
      const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
      const user = await this.userModel.createWithPassword(
        { email: dto.email, fullName: dto.fullName },
        passwordHash,
      );

      // Auto-create client record
      await this.clientModel.createFromUser(user.id, user.email, user.fullName).catch(() => {});

      const accessToken = this.generateToken(user);
      return { user, accessToken };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error('Gagal registrasi user', error);
      throw new InternalServerErrorException('Gagal membuat akun');
    }
  }

  /**
   * Login dengan email dan password
   */
  async loginWithCredentials(dto: LoginDto): Promise<{ user: AuthUser; accessToken: string }> {
    const record = await this.userModel.findByEmailWithPassword(dto.email);

    if (!record) {
      throw new UnauthorizedException('Email atau password salah');
    }

    if (!record.passwordHash) {
      throw new UnauthorizedException(
        'Akun ini terdaftar via Google. Silakan login dengan Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, record.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const { passwordHash: _, ...user } = record;
    const accessToken = this.generateToken(user);
    return { user, accessToken };
  }

  /**
   * Login atau registrasi via Google OAuth
   */
  async loginWithGoogle(googleUser: GoogleOAuthUser): Promise<{ user: AuthUser; accessToken: string }> {
    try {
      let user = await this.userModel.findByEmail(googleUser.email);

      const isNewUser = !user;
      if (!user) {
        user = await this.userModel.create({
          email: googleUser.email,
          fullName: googleUser.fullName,
          avatarUrl: googleUser.avatarUrl,
        });
      }

      // Auto-create client record untuk user baru via Google
      if (isNewUser) {
        await this.clientModel.createFromUser(user.id, user.email, user.fullName).catch(() => {});
      }

      const accessToken = this.generateToken(user);
      return { user, accessToken };
    } catch (error) {
      this.logger.error('Gagal memproses login Google', error);
      throw new InternalServerErrorException('Gagal memproses login Google');
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<AuthUser> {
    if (dto.email) {
      const existing = await this.userModel.findByEmail(dto.email);
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email sudah digunakan oleh akun lain');
      }
    }
    return this.userModel.updateProfile(userId, {
      fullName: dto.fullName,
      email:    dto.email,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Konfirmasi password tidak cocok');
    }
    const record = await this.userModel.findByIdWithPassword(userId);
    if (!record || !record.passwordHash) {
      throw new BadRequestException('Akun ini login via Google dan tidak memiliki password. Tidak bisa ganti password di sini.');
    }
    const isValid = await bcrypt.compare(dto.currentPassword, record.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Password saat ini tidak benar');
    }
    const newHash = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);
    await this.userModel.updatePassword(userId, newHash);
  }

  /**
   * Validasi user berdasarkan email — digunakan oleh JwtStrategy
   */
  async validateUser(email: string): Promise<AuthUser | null> {
    return this.userModel.findByEmail(email);
  }

  private generateToken(user: AuthUser): string {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }
}
