import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { ServicePackage } from '../types/service-package.types';

const SELECT = 'id, name, name_en, description, description_en, price, duration, duration_en, features, features_en, badge, badge_en, icon_url, category, sort_order, is_active, created_at, updated_at';

@Injectable()
export class ServicePackageModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findAll(): Promise<ServicePackage[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SERVICE_PACKAGES)
      .select(SELECT)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findAllActive(): Promise<ServicePackage[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SERVICE_PACKAGES)
      .select(SELECT)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string): Promise<ServicePackage | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SERVICE_PACKAGES)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async create(payload: Partial<ServicePackage>): Promise<ServicePackage> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SERVICE_PACKAGES)
      .insert([{
        name:           payload.name,
        name_en:        payload.nameEn        ?? null,
        description:    payload.description   ?? null,
        description_en: payload.descriptionEn ?? null,
        price:          payload.price         ?? 0,
        duration:       payload.duration      ?? null,
        duration_en:    payload.durationEn    ?? null,
        features:       payload.features      ?? null,
        features_en:    payload.featuresEn    ?? null,
        badge:          payload.badge         ?? null,
        badge_en:       payload.badgeEn       ?? null,
        icon_url:       payload.iconUrl       ?? null,
        category:       payload.category      ?? null,
        sort_order:     payload.sortOrder      ?? 0,
        is_active:      payload.isActive      ?? true,
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, payload: Partial<ServicePackage>): Promise<ServicePackage | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SERVICE_PACKAGES)
      .update({
        ...(payload.name         !== undefined && { name:           payload.name }),
        ...(payload.nameEn       !== undefined && { name_en:        payload.nameEn }),
        ...(payload.description  !== undefined && { description:    payload.description }),
        ...(payload.descriptionEn!== undefined && { description_en: payload.descriptionEn }),
        ...(payload.price        !== undefined && { price:          payload.price }),
        ...(payload.duration     !== undefined && { duration:       payload.duration }),
        ...(payload.durationEn   !== undefined && { duration_en:    payload.durationEn }),
        ...(payload.features     !== undefined && { features:       payload.features }),
        ...(payload.featuresEn   !== undefined && { features_en:    payload.featuresEn }),
        ...(payload.badge        !== undefined && { badge:          payload.badge }),
        ...(payload.badgeEn      !== undefined && { badge_en:       payload.badgeEn }),
        ...(payload.iconUrl      !== undefined && { icon_url:       payload.iconUrl }),
        ...(payload.category     !== undefined && { category:       payload.category }),
        ...(payload.sortOrder    !== undefined && { sort_order:     payload.sortOrder }),
        ...(payload.isActive     !== undefined && { is_active:      payload.isActive }),
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
      .from(SUPABASE_TABLES.SERVICE_PACKAGES)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  private map(row: Record<string, unknown>): ServicePackage {
    return {
      id:            row.id as string,
      name:          row.name as string,
      nameEn:        row.name_en        as string | null,
      description:   row.description   as string | null,
      descriptionEn: row.description_en as string | null,
      price:         row.price          as number,
      duration:      row.duration       as string | null,
      durationEn:    row.duration_en    as string | null,
      features:      row.features       as string | null,
      featuresEn:    row.features_en    as string | null,
      badge:         row.badge          as string | null,
      badgeEn:       row.badge_en       as string | null,
      iconUrl:       row.icon_url       as string | null,
      category:      row.category       as string | null,
      sortOrder:     row.sort_order     as number,
      isActive:      row.is_active      as boolean,
      createdAt:     row.created_at     as string,
      updatedAt:     row.updated_at     as string,
    };
  }
}
