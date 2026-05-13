import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { SoftwarePurchase } from '../types/software-purchase.types';

const SELECT = `
  id, client_id, software_id, software_name, software_price,
  quantity, total_price, receipt_image_url, payment_status,
  notes, verified_at, created_at, updated_at,
  users:client_id ( full_name, email )
`.trim();

const SELECT_SIMPLE = `
  id, client_id, software_id, software_name, software_price,
  quantity, total_price, receipt_image_url, payment_status,
  notes, verified_at, created_at, updated_at
`.trim();

@Injectable()
export class SoftwarePurchaseModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findAll(): Promise<SoftwarePurchase[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOFTWARE_PURCHASES)
      .select(SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as any[]).map(this.map);
  }

  async findByClient(clientId: string): Promise<SoftwarePurchase[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOFTWARE_PURCHASES)
      .select(SELECT_SIMPLE)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as any[]).map(this.map);
  }

  async findById(id: string): Promise<SoftwarePurchase | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOFTWARE_PURCHASES)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data as any) : null;
  }

  async create(payload: Partial<SoftwarePurchase>): Promise<SoftwarePurchase> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOFTWARE_PURCHASES)
      .insert([{
        client_id:      payload.clientId,
        software_id:    payload.softwareId,
        software_name:  payload.softwareName,
        software_price: payload.softwarePrice,
        quantity:       payload.quantity ?? 1,
        total_price:    payload.totalPrice,
      }])
      .select(SELECT_SIMPLE)
      .single();
    if (error) throw error;
    return this.map(data as any);
  }

  async uploadReceipt(id: string, receiptImageUrl: string): Promise<SoftwarePurchase | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOFTWARE_PURCHASES)
      .update({
        receipt_image_url: receiptImageUrl,
        payment_status:    'pending_verification',
        updated_at:        new Date().toISOString(),
      })
      .eq('id', id)
      .select(SELECT_SIMPLE)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data as any) : null;
  }

  async verify(id: string): Promise<SoftwarePurchase | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOFTWARE_PURCHASES)
      .update({
        payment_status: 'verified',
        verified_at:    new Date().toISOString(),
        updated_at:     new Date().toISOString(),
      })
      .eq('id', id)
      .select(SELECT_SIMPLE)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data as any) : null;
  }

  async reject(id: string, notes: string): Promise<SoftwarePurchase | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SOFTWARE_PURCHASES)
      .update({
        payment_status: 'rejected',
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(SELECT_SIMPLE)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data as any) : null;
  }

  private map(row: Record<string, unknown>): SoftwarePurchase {
    const user = row.users as Record<string, unknown> | null;
    return {
      id:               row.id as string,
      clientId:         row.client_id as string,
      clientName:       user?.full_name as string | undefined,
      clientEmail:      user?.email     as string | undefined,
      softwareId:       row.software_id    as string,
      softwareName:     row.software_name  as string,
      softwarePrice:    row.software_price as number,
      quantity:         row.quantity       as number,
      totalPrice:       row.total_price    as number,
      receiptImageUrl:  row.receipt_image_url as string | null,
      paymentStatus:    row.payment_status    as any,
      notes:            row.notes            as string | null,
      verifiedAt:       row.verified_at      as string | null,
      createdAt:        row.created_at       as string,
      updatedAt:        row.updated_at       as string,
    };
  }
}
