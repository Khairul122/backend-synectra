import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { Feedback } from '../types/feedback.types';

const SELECT = 'id, name, email, rating, message, is_approved, created_at, updated_at';

@Injectable()
export class FeedbackModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findAll(): Promise<Feedback[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.FEEDBACKS)
      .select(SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findApproved(): Promise<Feedback[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.FEEDBACKS)
      .select(SELECT)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string): Promise<Feedback | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.FEEDBACKS)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async create(payload: Partial<Feedback>): Promise<Feedback> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.FEEDBACKS)
      .insert([{
        name:    payload.name,
        email:   payload.email,
        rating:  payload.rating,
        message: payload.message ?? null,
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, payload: Partial<Feedback>): Promise<Feedback | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.FEEDBACKS)
      .update({
        ...(payload.name    !== undefined && { name:    payload.name }),
        ...(payload.email   !== undefined && { email:   payload.email }),
        ...(payload.rating  !== undefined && { rating:  payload.rating }),
        ...(payload.message !== undefined && { message: payload.message }),
        ...(payload.isApproved !== undefined && { is_approved: payload.isApproved }),
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
      .from(SUPABASE_TABLES.FEEDBACKS)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  private map(row: Record<string, unknown>): Feedback {
    return {
      id:        row.id as string,
      name:      row.name as string,
      email:     row.email as string,
      rating:    row.rating as number,
      message:   row.message as string | null,
      isApproved: row.is_approved as boolean,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}
