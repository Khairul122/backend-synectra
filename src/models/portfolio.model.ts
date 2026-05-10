import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { Portfolio } from '../types/portfolio.types';

const SELECT = 'id, title, description, image, images, category, created_at, updated_at';

@Injectable()
export class PortfolioModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findAll(): Promise<Portfolio[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PORTFOLIO)
      .select(SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string): Promise<Portfolio | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PORTFOLIO)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async create(payload: Partial<Portfolio>): Promise<Portfolio> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PORTFOLIO)
      .insert([{
        title:       payload.title,
        description: payload.description ?? null,
        image:       payload.image ?? null,
        images:      payload.images ?? [],
        category:    payload.category ?? null,
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, payload: Partial<Portfolio>): Promise<Portfolio | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PORTFOLIO)
      .update({
        ...(payload.title       !== undefined && { title:       payload.title }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.image       !== undefined && { image:       payload.image }),
        ...(payload.images      !== undefined && { images:      payload.images }),
        ...(payload.category    !== undefined && { category:    payload.category }),
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
      .from(SUPABASE_TABLES.PORTFOLIO)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  private map(row: Record<string, any>): Portfolio {
    return {
      id:          row.id,
      title:       row.title,
      description: row.description,
      image:       row.image,
      images:      row.images ?? [],
      category:    row.category,
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
    };
  }
}
