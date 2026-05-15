import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { ContactChannel } from '../types/contact-channel.types';

const SELECT = 'id, nama, platform, contact_info, link_url, icon, is_active, created_at, updated_at';

@Injectable()
export class ContactChannelModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findEmailContacts(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.CONTACT_CHANNELS)
      .select('contact_info')
      .like('contact_info', '%@%')
      .eq('is_active', true);
    if (error) return [];
    return (data ?? []).map(r => r.contact_info as string).filter(Boolean);
  }

  async findAll(): Promise<ContactChannel[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.CONTACT_CHANNELS)
      .select(SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string): Promise<ContactChannel | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.CONTACT_CHANNELS)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async create(payload: Partial<ContactChannel>): Promise<ContactChannel> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.CONTACT_CHANNELS)
      .insert([{
        nama:         payload.nama,
        platform:     payload.platform,
        contact_info: payload.contactInfo,
        link_url:     payload.linkUrl,
        icon:         payload.icon,
        is_active:    payload.isActive ?? true,
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async update(id: string, payload: Partial<ContactChannel>): Promise<ContactChannel | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.CONTACT_CHANNELS)
      .update({
        ...(payload.nama        !== undefined && { nama:         payload.nama }),
        ...(payload.platform    !== undefined && { platform:     payload.platform }),
        ...(payload.contactInfo !== undefined && { contact_info: payload.contactInfo }),
        ...(payload.linkUrl     !== undefined && { link_url:     payload.linkUrl }),
        ...(payload.icon        !== undefined && { icon:         payload.icon }),
        ...(payload.isActive    !== undefined && { is_active:    payload.isActive }),
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
      .from(SUPABASE_TABLES.CONTACT_CHANNELS)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  private map(row: Record<string, unknown>): ContactChannel {
    return {
      id:          row.id as string,
      nama:        row.nama as string,
      platform:    row.platform as string,
      contactInfo: row.contact_info as string,
      linkUrl:     row.link_url as string,
      icon:        row.icon as string,
      isActive:    row.is_active as boolean,
      createdAt:   row.created_at as string,
      updatedAt:   row.updated_at as string,
    };
  }
}
