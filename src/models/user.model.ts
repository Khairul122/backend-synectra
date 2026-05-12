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
      .select('id, email, full_name, avatar_url, role')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapToAuthUser(data);
  }

  /**
   * Cari user beserta password hash — hanya untuk keperluan verifikasi login
   */
  async findByEmailWithPassword(email: string): Promise<UserRecord | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.USERS)
      .select('id, email, full_name, avatar_url, role, password_hash')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return {
      ...this.mapToAuthUser(data),
      passwordHash: data.password_hash,
    };
  }

  /**
   * Buat user baru dari Google OAuth (tanpa password) — role default: client
   */
  async create(userData: Partial<AuthUser>): Promise<AuthUser> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.USERS)
      .insert([
        {
          email: userData.email,
          full_name: userData.fullName,
          avatar_url: userData.avatarUrl,
          role: userData.role ?? 'client',
        },
      ])
      .select('id, email, full_name, avatar_url, role')
      .single();

    if (error) throw error;

    return this.mapToAuthUser(data);
  }

  /**
   * Buat user baru dengan password hash — role default: client
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
          role: 'client',
        },
      ])
      .select('id, email, full_name, avatar_url, role')
      .single();

    if (error) throw error;

    return this.mapToAuthUser(data);
  }

  async findByIdWithPassword(id: string): Promise<UserRecord | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.USERS)
      .select('id, email, full_name, avatar_url, role, password_hash')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    return { ...this.mapToAuthUser(data), passwordHash: data.password_hash };
  }

  async updateProfile(id: string, payload: { fullName?: string; email?: string }): Promise<AuthUser> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.USERS)
      .update({
        ...(payload.fullName !== undefined && { full_name: payload.fullName }),
        ...(payload.email    !== undefined && { email:     payload.email }),
      })
      .eq('id', id)
      .select('id, email, full_name, avatar_url, role')
      .single();
    if (error) throw error;
    return this.mapToAuthUser(data);
  }

  async updatePassword(id: string, newPasswordHash: string): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.USERS)
      .update({ password_hash: newPasswordHash })
      .eq('id', id);
    if (error) throw error;
  }

  private mapToAuthUser(data: Record<string, string>): AuthUser {
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      role: (data.role as AuthUser['role']) ?? 'client',
    };
  }
}
