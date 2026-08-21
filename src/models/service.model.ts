import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { Service } from '../types/service.types';

const SELECT = 'id, title, title_en, description, description_en, icon_key, is_active, sort_order, created_at, updated_at';

@Injectable()
export class ServiceModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findAll(): Promise<Service[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SERVICES)
      .select(SELECT)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findAllActive(): Promise<Service[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SERVICES)
      .select(SELECT)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string): Promise<Service | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SERVICES)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async create(payload: Partial<Service>): Promise<Service> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SERVICES)
      .insert([{
        title:          payload.title,
        title_en:       payload.titleEn       ?? null,
        description:    payload.description   ?? null,
        description_en: payload.descriptionEn ?? null,
        icon_key:       payload.iconKey        ?? 'code',
        is_active:      payload.isActive       ?? true,
        sort_order:     payload.sortOrder      ?? 0,
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, payload: Partial<Service>): Promise<Service | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SERVICES)
      .update({
        ...(payload.title         !== undefined && { title:          payload.title }),
        ...(payload.titleEn       !== undefined && { title_en:       payload.titleEn }),
        ...(payload.description   !== undefined && { description:    payload.description }),
        ...(payload.descriptionEn !== undefined && { description_en: payload.descriptionEn }),
        ...(payload.iconKey       !== undefined && { icon_key:       payload.iconKey }),
        ...(payload.isActive      !== undefined && { is_active:      payload.isActive }),
        ...(payload.sortOrder     !== undefined && { sort_order:     payload.sortOrder }),
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
      .from(SUPABASE_TABLES.SERVICES)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  private map(row: Record<string, unknown>): Service {
    return {
      id:            row.id as string,
      title:         row.title as string,
      titleEn:       row.title_en       as string | null,
      description:   row.description   as string | null,
      descriptionEn: row.description_en as string | null,
      iconKey:       row.icon_key       as string,
      isActive:      row.is_active      as boolean,
      sortOrder:     row.sort_order     as number,
      createdAt:     row.created_at     as string,
      updatedAt:     row.updated_at     as string,
    };
  }
}
