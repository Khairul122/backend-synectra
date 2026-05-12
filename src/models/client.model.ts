import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';

export interface Client {
  id: string;
  userId: string | null;
  companyName: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  // joined from users
  fullName?: string;
  avatarUrl?: string;
  role?: string;
}

const SELECT = 'id, user_id, company_name, email, created_at, updated_at, users!user_id ( full_name, avatar_url, role )';

@Injectable()
export class ClientModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findAll(): Promise<Client[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.CLIENTS)
      .select(SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.CLIENTS)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async findByUserId(userId: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.CLIENTS)
      .select(SELECT)
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async createFromUser(userId: string, email: string, fullName: string): Promise<Client> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.CLIENTS)
      .insert([{ user_id: userId, email, company_name: fullName }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, payload: { companyName?: string; email?: string }): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.CLIENTS)
      .update({
        ...(payload.companyName !== undefined && { company_name: payload.companyName }),
        ...(payload.email       !== undefined && { email:        payload.email }),
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
      .from(SUPABASE_TABLES.CLIENTS)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  private map(row: Record<string, any>): Client {
    const user = row.users as any;
    return {
      id:          row.id,
      userId:      row.user_id,
      companyName: row.company_name,
      email:       row.email,
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
      fullName:    user?.full_name ?? null,
      avatarUrl:   user?.avatar_url ?? null,
      role:        user?.role ?? null,
    };
  }
}
