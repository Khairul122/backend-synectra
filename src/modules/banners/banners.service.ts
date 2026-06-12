import { Injectable, NotFoundException } from '@nestjs/common';
import { BannerModel } from '../../models/banner.model';
import { Banner } from '../../types/banner.types';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { cached, invalidateCache } from '../../common/utils/memory-cache';

const CACHE_KEY = 'banners:findAll';
const CACHE_TTL = 60_000;

@Injectable()
export class BannersService {
  constructor(private readonly bannerModel: BannerModel) {}

  findAll(): Promise<Banner[]> {
    return cached(CACHE_KEY, CACHE_TTL, () => this.bannerModel.findAll());
  }

  async findById(id: string): Promise<Banner> {
    const banner = await this.bannerModel.findById(id);
    if (!banner) throw new NotFoundException(`Banner dengan id ${id} tidak ditemukan`);
    return banner;
  }

  async create(dto: CreateBannerDto): Promise<Banner> {
    const banner = await this.bannerModel.create(dto);
    invalidateCache(CACHE_KEY);
    return banner;
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    await this.findById(id);
    const updated = await this.bannerModel.update(id, dto);
    if (!updated) throw new NotFoundException(`Banner dengan id ${id} tidak ditemukan`);
    invalidateCache(CACHE_KEY);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.bannerModel.delete(id);
    invalidateCache(CACHE_KEY);
  }
}
