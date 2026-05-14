import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { OrderRevision } from '../types/order.types';

@Injectable()
export class OrderRevisionModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findByOrder(orderId: string): Promise<OrderRevision[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.ORDER_REVISIONS)
      .select('id, order_id, items, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async create(orderId: string, items: Array<{ notes: string; images: string[] }>): Promise<OrderRevision> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.ORDER_REVISIONS)
      .insert([{ order_id: orderId, items }])
      .select('id, order_id, items, created_at')
      .single();
    if (error) throw error;
    return this.map(data);
  }

  private map(row: Record<string, any>): OrderRevision {
    return {
      id:        row.id,
      orderId:   row.order_id,
      items:     row.items ?? [],
      createdAt: row.created_at,
    };
  }
}
