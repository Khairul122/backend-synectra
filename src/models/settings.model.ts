import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_TABLES } from '../constants';

@Injectable()
export class SettingsModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  /**
   * Ambil nilai setting berdasarkan key, null jika belum diset
   */
  async getValue(key: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    return data?.value ?? null;
  }

  /**
   * Simpan atau update nilai setting berdasarkan key
   */
  async setValue(key: string, value: string): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) throw error;
  }
}
