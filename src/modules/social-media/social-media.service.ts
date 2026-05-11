import { Injectable, NotFoundException } from '@nestjs/common';
import { SocialMediaModel } from '../../models/social-media.model';
import { SocialMedia } from '../../types/social-media.types';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';

@Injectable()
export class SocialMediaService {
  constructor(private readonly socialMediaModel: SocialMediaModel) {}

  findAll(): Promise<SocialMedia[]> {
    return this.socialMediaModel.findAll();
  }

  async findById(id: string): Promise<SocialMedia> {
    const item = await this.socialMediaModel.findById(id);
    if (!item) throw new NotFoundException(`Sosial media dengan id ${id} tidak ditemukan`);
    return item;
  }

  create(dto: CreateSocialMediaDto): Promise<SocialMedia> {
    return this.socialMediaModel.create(dto);
  }

  async update(id: string, dto: UpdateSocialMediaDto): Promise<SocialMedia> {
    await this.findById(id);
    const updated = await this.socialMediaModel.update(id, dto);
    if (!updated) throw new NotFoundException(`Sosial media dengan id ${id} tidak ditemukan`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.socialMediaModel.delete(id);
  }
}
