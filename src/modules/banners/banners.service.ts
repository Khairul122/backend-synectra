import { Injectable, NotFoundException } from '@nestjs/common';
import { BannerModel } from '../../models/banner.model';
import { Banner } from '../../types/banner.types';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly bannerModel: BannerModel) {}

  findAll(): Promise<Banner[]> {
    return this.bannerModel.findAll();
  }

  async findById(id: string): Promise<Banner> {
    const banner = await this.bannerModel.findById(id);
    if (!banner) throw new NotFoundException(`Banner dengan id ${id} tidak ditemukan`);
    return banner;
  }

  create(dto: CreateBannerDto): Promise<Banner> {
    return this.bannerModel.create(dto);
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    await this.findById(id);
    const updated = await this.bannerModel.update(id, dto);
    if (!updated) throw new NotFoundException(`Banner dengan id ${id} tidak ditemukan`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.bannerModel.delete(id);
  }
}
