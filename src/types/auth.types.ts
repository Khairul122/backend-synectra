export interface GoogleProfile {
  id: string;
  emails: { value: string; verified: boolean }[];
  displayName: string;
  photos: { value: string }[];
}

export type UserRole = 'client' | 'admin' | 'staff';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface GoogleOAuthUser {
  email: string;
  fullName: string;
  avatarUrl: string;
  accessToken: string;
}

export interface UserRecord extends AuthUser {
  passwordHash: string | null;
}
