import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { ProgressReport } from '../types/progress-report.types';

const SELECT = 'id, order_id, title, description, progress_percentage, attachment_url, reported_at';

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
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
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
    };
  }
}
