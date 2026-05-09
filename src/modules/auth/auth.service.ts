import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserModel } from '../../models/user.model';
import { AuthUser, GoogleOAuthUser, JwtPayload } from '../../types/auth.types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    private userModel: UserModel,
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

      if (!user) {
        user = await this.userModel.create({
          email: googleUser.email,
          fullName: googleUser.fullName,
          avatarUrl: googleUser.avatarUrl,
        });
      }

      const accessToken = this.generateToken(user);
      return { user, accessToken };
    } catch (error) {
      this.logger.error('Gagal memproses login Google', error);
      throw new InternalServerErrorException('Gagal memproses login Google');
    }
  }

  /**
   * Validasi user berdasarkan email — digunakan oleh JwtStrategy
   */
  async validateUser(email: string): Promise<AuthUser | null> {
    return this.userModel.findByEmail(email);
  }

  private generateToken(user: AuthUser): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
