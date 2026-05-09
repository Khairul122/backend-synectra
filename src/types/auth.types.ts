export interface GoogleProfile {
  id: string;
  emails: { value: string; verified: boolean }[];
  displayName: string;
  photos: { value: string }[];
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface GoogleOAuthUser {
  email: string;
  fullName: string;
  avatarUrl: string;
  accessToken: string;
}
