import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { GoogleOAuthUser, GoogleProfile } from '../../../types/auth.types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('google.clientId');
    const clientSecret = configService.get<string>('google.clientSecret');
    const callbackURL = configService.get<string>('google.callbackUrl');

    if (!clientID || !clientSecret) {
      throw new Error(
        'Google OAuth configuration is missing. Please check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, displayName } = profile ?? {};
    const email = emails?.[0]?.value;

    if (!email) {
      done(
        new UnauthorizedException(
          'Akun Google tidak mengizinkan akses ke alamat email. Coba login ulang dan pastikan izin email diberikan.',
        ),
        false,
      );
      return;
    }

    const fullName =
      `${name?.givenName ?? ''} ${name?.familyName ?? ''}`.trim() ||
      displayName ||
      email;

    const user: GoogleOAuthUser = {
      email,
      fullName,
      avatarUrl: photos?.[0]?.value,
      accessToken,
    };
    done(null, user);
  }
}
