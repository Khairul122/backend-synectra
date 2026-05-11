import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { Banner } from '../types/banner.types';

const SELECT = 'id, title, description, image, is_active, created_at, updated_at';

@Injectable()
export class BannerModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findAll(): Promise<Banner[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.BANNERS)
      .select(SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string): Promise<Banner | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.BANNERS)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async create(payload: Partial<Banner>): Promise<Banner> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.BANNERS)
      .insert([{
        title:       payload.title,
        description: payload.description ?? null,
        image:       payload.image ?? null,
        is_active:   payload.isActive ?? true,
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, payload: Partial<Banner>): Promise<Banner | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.BANNERS)
      .update({
        ...(payload.title       !== undefined && { title:       payload.title }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.image       !== undefined && { image:       payload.image }),
        ...(payload.isActive    !== undefined && { is_active:   payload.isActive }),
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
      .from(SUPABASE_TABLES.BANNERS)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  private map(row: Record<string, unknown>): Banner {
    return {
      id:          row.id as string,
      title:       row.title as string,
      description: row.description as string | null,
      image:       row.image as string | null,
      isActive:    row.is_active as boolean,
      createdAt:   row.created_at as string,
      updatedAt:   row.updated_at as string,
    };
  }
}
