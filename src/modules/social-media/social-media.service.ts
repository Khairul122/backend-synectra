import { Injectable, NotFoundException } from '@nestjs/common';
import { SocialMediaModel } from '../../models/social-media.model';
import { SocialMedia } from '../../types/social-media.types';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';
import { cached, invalidateCache } from '../../common/utils/memory-cache';

const CACHE_KEY = 'social-media:findAll';
const CACHE_TTL = 60_000;

@Injectable()
export class SocialMediaService {
  constructor(private readonly socialMediaModel: SocialMediaModel) {}

  findAll(): Promise<SocialMedia[]> {
    return cached(CACHE_KEY, CACHE_TTL, () => this.socialMediaModel.findAll());
  }

  async findById(id: string): Promise<SocialMedia> {
    const item = await this.socialMediaModel.findById(id);
    if (!item) throw new NotFoundException(`Sosial media dengan id ${id} tidak ditemukan`);
    return item;
  }

  async create(dto: CreateSocialMediaDto): Promise<SocialMedia> {
    const item = await this.socialMediaModel.create(dto);
    invalidateCache(CACHE_KEY);
    return item;
  }

  async update(id: string, dto: UpdateSocialMediaDto): Promise<SocialMedia> {
    await this.findById(id);
    const updated = await this.socialMediaModel.update(id, dto);
    if (!updated) throw new NotFoundException(`Sosial media dengan id ${id} tidak ditemukan`);
    invalidateCache(CACHE_KEY);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.socialMediaModel.delete(id);
    invalidateCache(CACHE_KEY);
  }
}
