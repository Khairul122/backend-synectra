import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { SoftwareProduct } from '../types/software-product.types';

const SELECT = 'id, name, name_en, description, description_en, category, price, demo_url, thumbnail_url, tech_stack, features, features_en, softcopy_url, is_active, sort_order, created_at, updated_at';

@Injectable()
export class SoftwareProductModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findAll(): Promise<SoftwareProduct[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOFTWARE_PRODUCTS)
      .select(SELECT)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findAllActive(): Promise<SoftwareProduct[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOFTWARE_PRODUCTS)
      .select(SELECT)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string): Promise<SoftwareProduct | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOFTWARE_PRODUCTS)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async create(payload: Partial<SoftwareProduct>): Promise<SoftwareProduct> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOFTWARE_PRODUCTS)
      .insert([{
        name:           payload.name,
        name_en:        payload.nameEn        ?? null,
        description:    payload.description   ?? null,
        description_en: payload.descriptionEn ?? null,
        category:       payload.category      ?? null,
        price:          payload.price         ?? 0,
        demo_url:       payload.demoUrl       ?? null,
        thumbnail_url:  payload.thumbnailUrl  ?? null,
        tech_stack:     payload.techStack     ?? null,
        features:       payload.features      ?? null,
        features_en:    payload.featuresEn    ?? null,
        softcopy_url:   payload.softcopyUrl    ?? null,
        is_active:      payload.isActive       ?? true,
        sort_order:     payload.sortOrder      ?? 0,
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, payload: Partial<SoftwareProduct>): Promise<SoftwareProduct | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOFTWARE_PRODUCTS)
      .update({
        ...(payload.name          !== undefined && { name:           payload.name }),
        ...(payload.nameEn        !== undefined && { name_en:        payload.nameEn }),
        ...(payload.description   !== undefined && { description:    payload.description }),
        ...(payload.descriptionEn !== undefined && { description_en: payload.descriptionEn }),
        ...(payload.category      !== undefined && { category:       payload.category }),
        ...(payload.price         !== undefined && { price:          payload.price }),
        ...(payload.demoUrl       !== undefined && { demo_url:       payload.demoUrl }),
        ...(payload.thumbnailUrl  !== undefined && { thumbnail_url:  payload.thumbnailUrl }),
        ...(payload.techStack     !== undefined && { tech_stack:     payload.techStack }),
        ...(payload.features      !== undefined && { features:       payload.features }),
        ...(payload.featuresEn    !== undefined && { features_en:    payload.featuresEn }),
        ...(payload.softcopyUrl   !== undefined && { softcopy_url:   payload.softcopyUrl }),
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
      .from(SUPABASE_TABLES.SOFTWARE_PRODUCTS)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  private map(row: Record<string, unknown>): SoftwareProduct {
    return {
      id:            row.id as string,
      name:          row.name as string,
      nameEn:        row.name_en        as string | null,
      description:   row.description   as string | null,
      descriptionEn: row.description_en as string | null,
      category:      row.category      as string | null,
      price:         row.price         as number,
      demoUrl:       row.demo_url      as string | null,
      thumbnailUrl:  row.thumbnail_url as string | null,
      techStack:     row.tech_stack    as string | null,
      features:      row.features      as string | null,
      featuresEn:    row.features_en   as string | null,
      softcopyUrl:   row.softcopy_url  as string | null,
      isActive:      row.is_active     as boolean,
      sortOrder:     row.sort_order    as number,
      createdAt:     row.created_at    as string,
      updatedAt:     row.updated_at    as string,
    };
  }
}
