import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserModel } from '../../models/user.model';
import { AuthUser, GoogleOAuthUser, JwtPayload } from '../../types/auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userModel: UserModel,
    private jwtService: JwtService,
  ) {}

  /**
   * Memproses login dari Google OAuth — cari atau buat user, lalu generate JWT
   * @param googleUser Data user yang diterima dari Google strategy
   * @returns User dari database beserta JWT access token
   */
  async loginWithGoogle(
    googleUser: GoogleOAuthUser,
  ): Promise<{ user: AuthUser; accessToken: string }> {
    try {
      let user = await this.userModel.findByEmail(googleUser.email);

      if (!user) {
        user = await this.userModel.create({
          email: googleUser.email,
          fullName: googleUser.fullName,
          avatarUrl: googleUser.avatarUrl,
        });
      }

      const payload: JwtPayload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload);

      return { user, accessToken };
    } catch (error) {
      this.logger.error('Gagal memproses login Google', error);
      throw new InternalServerErrorException('Gagal memproses login Google');
    }
  }

  /**
   * Validasi user berdasarkan email — digunakan oleh JwtStrategy
   * @param email Email user yang akan divalidasi
   * @returns AuthUser jika ditemukan, null jika tidak
   */
  async validateUser(email: string): Promise<AuthUser | null> {
    return this.userModel.findByEmail(email);
  }
}
