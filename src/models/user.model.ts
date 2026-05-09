import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_TABLES } from '../constants';
import { AuthUser, UserRecord } from '../types/auth.types';

@Injectable()
export class UserModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  /**
   * Cari user berdasarkan email, tanpa password hash
   */
  async findByEmail(email: string): Promise<AuthUser | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.USERS)
      .select('id, email, full_name, avatar_url')
      .eq('email', email)
      .single();

    if (error || !data) return null;

    return this.mapToAuthUser(data);
  }

  /**
   * Cari user beserta password hash — hanya untuk keperluan verifikasi login
   */
  async findByEmailWithPassword(email: string): Promise<UserRecord | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.USERS)
      .select('id, email, full_name, avatar_url, password_hash')
      .eq('email', email)
      .single();

    if (error || !data) return null;

    return {
      ...this.mapToAuthUser(data),
      passwordHash: data.password_hash,
    };
  }

  /**
   * Buat user baru dari Google OAuth (tanpa password)
   */
  async create(userData: Partial<AuthUser>): Promise<AuthUser> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.USERS)
      .insert([
        {
          email: userData.email,
          full_name: userData.fullName,
          avatar_url: userData.avatarUrl,
        },
      ])
      .select('id, email, full_name, avatar_url')
      .single();

    if (error) throw error;

    return this.mapToAuthUser(data);
  }

  /**
   * Buat user baru dengan password hash (registrasi email)
   */
  async createWithPassword(
    userData: Pick<AuthUser, 'email' | 'fullName'>,
    passwordHash: string,
  ): Promise<AuthUser> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.USERS)
      .insert([
        {
          email: userData.email,
          full_name: userData.fullName,
          password_hash: passwordHash,
        },
      ])
      .select('id, email, full_name, avatar_url')
      .single();

    if (error) throw error;

    return this.mapToAuthUser(data);
  }

  private mapToAuthUser(data: Record<string, string>): AuthUser {
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
    };
  }
}
