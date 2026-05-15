import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { Payment } from '../types/payment.types';

const SELECT = 'id, order_id, payment_type, amount, receipt_image_url, payment_number, status, notes, verified_at, created_at';

@Injectable()
export class PaymentModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findVerifiedForIncome(): Promise<{ amount: number; verifiedAt: string }[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PAYMENTS)
      .select('amount, verified_at')
      .eq('status', 'verified')
      .not('verified_at', 'is', null)
      .order('verified_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(r => ({
      amount:     Number(r.amount),
      verifiedAt: r.verified_at as string,
    }));
  }

  async findByOrder(orderId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PAYMENTS)
      .select(SELECT)
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PAYMENTS)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async create(payload: Partial<Payment>): Promise<Payment> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PAYMENTS)
      .insert([{
        order_id:          payload.orderId,
        payment_type:      payload.paymentType,
        amount:            payload.amount,
        receipt_image_url: payload.receiptImageUrl ?? null,
        payment_number:    payload.paymentNumber ?? null,
        notes:             payload.notes ?? null,
        status:            'pending_verification',
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async verify(id: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PAYMENTS)
      .update({ status: 'verified', verified_at: new Date().toISOString() })
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async reject(id: string, notes: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PAYMENTS)
      .update({ status: 'rejected', notes })
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  private map(row: Record<string, unknown>): Payment {
    return {
      id:              row.id as string,
      orderId:         row.order_id as string,
      paymentType:     row.payment_type as string,
      amount:          row.amount as number,
      receiptImageUrl: row.receipt_image_url as string,
      paymentNumber:   row.payment_number as string | null,
      status:          row.status as any,
      notes:           row.notes as string | null,
      verifiedAt:      row.verified_at as string | null,
      createdAt:       row.created_at as string,
    };
  }
}
