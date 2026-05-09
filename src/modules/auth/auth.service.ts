import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from '../../models/user.model';
import { AuthUser, JwtPayload } from '../../types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private userModel: UserModel,
    private jwtService: JwtService,
  ) {}

  /**
   * Memproses login dari Google OAuth
   * @param googleUser Data user dari Google
   */
  async loginWithGoogle(googleUser: Partial<AuthUser>) {
    try {
      let user = await this.userModel.findByEmail(googleUser.email!);

      if (!user) {
        user = await this.userModel.create({
          email: googleUser.email,
          fullName: googleUser.fullName,
          avatarUrl: googleUser.avatarUrl,
        });
      }

      const payload: JwtPayload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload);

      return {
        user,
        accessToken,
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal memproses login Google');
    }
  }

  /**
   * Validasi user untuk JWT strategy
   */
  async validateUser(email: string): Promise<AuthUser | null> {
    return this.userModel.findByEmail(email);
  }
}
