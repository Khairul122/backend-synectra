import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_TABLES } from '../constants';
import { Todo } from '../types/todo.types';

const SELECT = 'id, admin_id, title, todo_date, is_completed, sort_order, created_at, updated_at';

@Injectable()
export class TodoModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findByAdminAndDate(adminId: string, date: string): Promise<Todo[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.TODOS)
      .select(SELECT)
      .eq('admin_id', adminId)
      .eq('todo_date', date)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findUncompletedByAdminAndDate(adminId: string, date: string): Promise<Todo[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.TODOS)
      .select(SELECT)
      .eq('admin_id', adminId)
      .eq('todo_date', date)
      .eq('is_completed', false)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string, adminId: string): Promise<Todo | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.TODOS)
      .select(SELECT)
      .eq('id', id)
      .eq('admin_id', adminId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async getMaxSortOrder(adminId: string, date: string): Promise<number> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.TODOS)
      .select('sort_order')
      .eq('admin_id', adminId)
      .eq('todo_date', date)
      .order('sort_order', { ascending: false })
      .limit(1);
    if (error) throw error;
    return data && data.length > 0 ? (data[0].sort_order as number) : -1;
  }

  async create(payload: {
    adminId: string;
    title: string;
    todoDate: string;
    sortOrder: number;
  }): Promise<Todo> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.TODOS)
      .insert([{
        admin_id:   payload.adminId,
        title:      payload.title,
        todo_date:  payload.todoDate,
        sort_order: payload.sortOrder,
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async bulkCreate(items: Array<{
    adminId: string;
    title: string;
    todoDate: string;
    sortOrder: number;
  }>): Promise<Todo[]> {
    const rows = items.map(item => ({
      admin_id:   item.adminId,
      title:      item.title,
      todo_date:  item.todoDate,
      sort_order: item.sortOrder,
    }));
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.TODOS)
      .insert(rows)
      .select(SELECT);
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async update(id: string, adminId: string, payload: {
    title?: string;
    sortOrder?: number;
  }): Promise<Todo | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.TODOS)
      .update({
        ...(payload.title     !== undefined && { title:      payload.title }),
        ...(payload.sortOrder !== undefined && { sort_order: payload.sortOrder }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('admin_id', adminId)
      .select(SELECT)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async toggleComplete(id: string, adminId: string, isCompleted: boolean): Promise<Todo | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.TODOS)
      .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('admin_id', adminId)
      .select(SELECT)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async delete(id: string, adminId: string): Promise<void> {
    const { error } = await this.supabase
      .from(SUPABASE_TABLES.TODOS)
      .delete()
      .eq('id', id)
      .eq('admin_id', adminId);
    if (error) throw error;
  }

  private map(row: Record<string, unknown>): Todo {
    return {
      id:          row.id as string,
      adminId:     row.admin_id as string,
      title:       row.title as string,
      todoDate:    row.todo_date as string,
      isCompleted: row.is_completed as boolean,
      sortOrder:   row.sort_order as number,
      createdAt:   row.created_at as string,
      updatedAt:   row.updated_at as string,
    };
  }
}
