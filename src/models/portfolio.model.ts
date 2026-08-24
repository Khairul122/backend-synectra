import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../constants';
import { Portfolio } from '../types/portfolio.types';

const SELECT =
  'id, title, description, image, images, category, repo_url, github_repo_id, created_at, updated_at';

@Injectable()
export class PortfolioModel {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url')!;
    const key = this.configService.get<string>('supabase.serviceRoleKey')!;
    this.supabase = createClient(url, key);
  }

  async findAll(): Promise<Portfolio[]> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PORTFOLIO)
      .select(SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.map);
  }

  async findById(id: string): Promise<Portfolio | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PORTFOLIO)
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.map(data) : null;
  }

  async create(payload: Partial<Portfolio>): Promise<Portfolio> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PORTFOLIO)
      .insert([
        {
          title: payload.title,
          description: payload.description ?? null,
          image: payload.image ?? null,
          images: payload.images ?? [],
          category: payload.category ?? null,
        },
      ])
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  async update(
    id: string,
    payload: Partial<Portfolio>,
  ): Promise<Portfolio | null> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PORTFOLIO)
      .update({
        ...(payload.title !== undefined && { title: payload.title }),
        ...(payload.description !== undefined && {
          description: payload.description,
        }),
        ...(payload.image !== undefined && { image: payload.image }),
        ...(payload.images !== undefined && { images: payload.images }),
        ...(payload.category !== undefined && { category: payload.category }),
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
      .from(SUPABASE_TABLES.PORTFOLIO)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  /**
   * Upsert entry portfolio dari data repo GitHub, berdasarkan githubRepoId.
   * Dipakai oleh webhook — repo yang sama tidak boleh menghasilkan duplikat
   * meski event "created" dan "edited" (topic ditambahkan belakangan) sama-sama lolos filter.
   */
  async upsertFromGithubRepo(payload: {
    githubRepoId: number;
    title: string;
    description: string | null;
    repoUrl: string;
  }): Promise<Portfolio> {
    const { data, error } = await this.supabase
      .from(SUPABASE_TABLES.PORTFOLIO)
      .upsert(
        {
          github_repo_id: payload.githubRepoId,
          title: payload.title,
          description: payload.description,
          repo_url: payload.repoUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'github_repo_id' },
      )
      .select(SELECT)
      .single();
    if (error) throw error;
    return this.map(data);
  }

  private map(row: Record<string, unknown>): Portfolio {
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string | null,
      image: row.image as string | null,
      images: (row.images as string[]) ?? [],
      category: row.category as string | null,
      repoUrl: row.repo_url as string | null,
      githubRepoId: row.github_repo_id as number | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}
