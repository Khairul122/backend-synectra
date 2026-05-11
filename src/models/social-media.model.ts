import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { SocialMedia } from '../types/social-media.types';

const SELECT = 'id, platform_name, account_name, url, icon, is_active, created_at, updated_at';

@Injectable()
export class SocialMediaModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findAll(): Promise<SocialMedia[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOCIAL_MEDIA)
      .select(SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string): Promise<SocialMedia | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOCIAL_MEDIA)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async create(payload: Partial<SocialMedia>): Promise<SocialMedia> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOCIAL_MEDIA)
      .insert([{
        platform_name: payload.platformName,
        account_name:  payload.accountName,
        url:           payload.url,
        icon:          payload.icon ?? null,
        is_active:     payload.isActive ?? true,
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, payload: Partial<SocialMedia>): Promise<SocialMedia | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOCIAL_MEDIA)
      .update({
        ...(payload.platformName !== undefined && { platform_name: payload.platformName }),
        ...(payload.accountName  !== undefined && { account_name:  payload.accountName }),
        ...(payload.url          !== undefined && { url:           payload.url }),
        ...(payload.icon         !== undefined && { icon:          payload.icon }),
        ...(payload.isActive     !== undefined && { is_active:     payload.isActive }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.SOCIAL_MEDIA)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  private map(row: Record<string, unknown>): SocialMedia {
    return {
      id:           row.id as string,
      platformName: row.platform_name as string,
      accountName:  row.account_name as string,
      url:          row.url as string,
      icon:         row.icon as string | null,
      isActive:     row.is_active as boolean,
      createdAt:    row.created_at as string,
      updatedAt:    row.updated_at as string,
    };
  }
}
