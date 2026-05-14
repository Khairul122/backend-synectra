import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { Order } from '../types/order.types';

const SELECT = `
  id, client_id, title, service_category, description,
  total_price, deadline, status, revision_data, created_at, updated_at,
  users!client_id ( full_name, email )
`.trim();

@Injectable()
export class OrderModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findAll(): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.ORDERS)
      .select(SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findByClient(clientId: string): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.ORDERS)
      .select(SELECT)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.ORDERS)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async create(payload: Partial<Order>): Promise<Order> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.ORDERS)
      .insert([{
        client_id:        payload.clientId,
        title:            payload.title,
        service_category: payload.serviceCategory ?? null,
        description:      payload.description ?? null,
        total_price:      payload.totalPrice ?? null,
        deadline:         payload.deadline ?? null,
        status:           'pending',
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async updateStatus(id: string, status: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.ORDERS)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async updateDetails(id: string, payload: { totalPrice?: number; deadline?: string; description?: string }): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.ORDERS)
      .update({
        ...(payload.totalPrice  !== undefined && { total_price: payload.totalPrice }),
        ...(payload.deadline    !== undefined && { deadline:    payload.deadline }),
        ...(payload.description !== undefined && { description: payload.description }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  private map(row: Record<string, any>): Order {
    const user = row.users as any;
    return {
      id:              row.id,
      clientId:        row.client_id,
      clientName:      user?.full_name ?? null,
      clientEmail:     user?.email ?? null,
      title:           row.title,
      serviceCategory: row.service_category,
      description:     row.description,
      totalPrice:      row.total_price,
      deadline:        row.deadline,
      status:          row.status,
      revisionData:    row.revision_data ?? null,
      createdAt:       row.created_at,
      updatedAt:       row.updated_at,
    };
  }

  async requestRevision(id: string, items: Array<{ notes: string; images: string[] }>): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.ORDERS)
      .update({
        status:        'revision',
        revision_data: items,
        updated_at:    new Date().toISOString(),
      })
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }
}
