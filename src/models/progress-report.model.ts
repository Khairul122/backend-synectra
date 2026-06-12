import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { ProgressReport } from '../types/progress-report.types';

const SELECT = 'id, order_id, title, description, progress_percentage, attachment_url, reported_at, is_locked';

@Injectable()
export class ProgressReportModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findByOrder(orderId: string): Promise<ProgressReport[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PROGRESS_REPORTS)
      .select(SELECT)
      .eq('order_id', orderId)
      .order('reported_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async create(payload: Partial<ProgressReport>): Promise<ProgressReport> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PROGRESS_REPORTS)
      .insert([{
        order_id:            payload.orderId,
        title:               payload.title,
        description:         payload.description ?? null,
        progress_percentage: payload.progressPercentage ?? 0,
        attachment_url:      payload.attachmentUrl ?? null,
        is_locked:           payload.isLocked ?? false,
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async findById(id: string): Promise<ProgressReport | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PROGRESS_REPORTS)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async update(id: string, payload: Partial<ProgressReport>): Promise<ProgressReport | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PROGRESS_REPORTS)
      .update({
        ...(payload.title              !== undefined && { title:               payload.title }),
        ...(payload.description        !== undefined && { description:         payload.description }),
        ...(payload.progressPercentage !== undefined && { progress_percentage: payload.progressPercentage }),
        ...(payload.attachmentUrl      !== undefined && { attachment_url:      payload.attachmentUrl }),
        ...(payload.isLocked           !== undefined && { is_locked:           payload.isLocked }),
      })
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async unlockByOrder(orderId: string): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.PROGRESS_REPORTS)
      .update({ is_locked: false })
      .eq('order_id', orderId)
      .eq('is_locked', true);
    if (error) throw error;
  }

  private map(row: Record<string, unknown>): ProgressReport {
    return {
      id:                 row.id as string,
      orderId:            row.order_id as string,
      title:              row.title as string,
      description:        row.description as string | null,
      progressPercentage: row.progress_percentage as number,
      attachmentUrl:      row.attachment_url as string | null,
      reportedAt:         row.reported_at as string,
      isLocked:           row.is_locked as boolean,
    };
  }
}
