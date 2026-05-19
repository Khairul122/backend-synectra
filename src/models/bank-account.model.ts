import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { BankAccount } from '../types/bank-account.types';

const SELECT = 'id, bank_name, account_number, account_holder, bank_logo, payment_type, qris_image_url, is_active, created_at, updated_at';

@Injectable()
export class BankAccountModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findAll(): Promise<BankAccount[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.BANK_ACCOUNTS)
      .select(SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string): Promise<BankAccount | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.BANK_ACCOUNTS)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async create(payload: Partial<BankAccount>): Promise<BankAccount> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.BANK_ACCOUNTS)
      .insert([{
        bank_name:      payload.bankName,
        account_number: payload.accountNumber,
        account_holder: payload.accountHolder,
        bank_logo:      payload.bankLogo     ?? null,
        payment_type:   payload.paymentType  ?? 'bank',
        qris_image_url: payload.qrisImageUrl ?? null,
        is_active:      payload.isActive     ?? true,
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, payload: Partial<BankAccount>): Promise<BankAccount | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.BANK_ACCOUNTS)
      .update({
        ...(payload.bankName      !== undefined && { bank_name:      payload.bankName }),
        ...(payload.accountNumber !== undefined && { account_number: payload.accountNumber }),
        ...(payload.accountHolder !== undefined && { account_holder: payload.accountHolder }),
        ...(payload.bankLogo      !== undefined && { bank_logo:      payload.bankLogo }),
        ...(payload.paymentType   !== undefined && { payment_type:   payload.paymentType }),
        ...(payload.qrisImageUrl  !== undefined && { qris_image_url: payload.qrisImageUrl }),
        ...(payload.isActive      !== undefined && { is_active:      payload.isActive }),
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
      .from(SUPABASE_TABLES.BANK_ACCOUNTS)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  private map(row: Record<string, unknown>): BankAccount {
    return {
      id:            row.id as string,
      bankName:      row.bank_name as string,
      accountNumber: row.account_number as string,
      accountHolder: row.account_holder as string,
      bankLogo:      row.bank_logo as string | null,
      paymentType:   (row.payment_type ?? 'bank') as 'bank' | 'qris' | 'both',
      qrisImageUrl:  row.qris_image_url as string | null,
      isActive:      row.is_active as boolean,
      createdAt:     row.created_at as string,
      updatedAt:     row.updated_at as string,
    };
  }
}
