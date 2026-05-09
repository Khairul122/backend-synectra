import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { AuthUser } from '../types/auth.types';

@Injectable()
export class UserModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url');
    const key = this.configService.get<string>('supabase.serviceRoleKey');
    this.supabase = createClient(url, key);
  }

  /**
   * Mencari user berdasarkan email
   */
  async findByEmail(email: string): Promise<AuthUser | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.USERS)
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
    };
  }

  /**
   * Membuat user baru (biasanya saat pertama kali login Google)
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
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
    };
  }
}
