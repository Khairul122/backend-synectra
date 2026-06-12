import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactChannelModel } from '../../models/contact-channel.model';
import { ContactChannel } from '../../types/contact-channel.types';
import { CreateContactChannelDto } from './dto/create-contact-channel.dto';
import { UpdateContactChannelDto } from './dto/update-contact-channel.dto';
import { cached, invalidateCache } from '../../common/utils/memory-cache';

const CACHE_KEY = 'contacts:findAll';
const CACHE_TTL = 60_000;

@Injectable()
export class ContactsService {
  constructor(private readonly model: ContactChannelModel) {}

  findAll(): Promise<ContactChannel[]> {
    return cached(CACHE_KEY, CACHE_TTL, () => this.model.findAll());
  }

  async findById(id: string): Promise<ContactChannel> {
    const item = await this.model.findById(id);
    if (!item) throw new NotFoundException(`Kontak dengan id ${id} tidak ditemukan`);
    return item;
  }

  async create(dto: CreateContactChannelDto): Promise<ContactChannel> {
    const item = await this.model.create(dto);
    invalidateCache(CACHE_KEY);
    return item;
  }

  async update(id: string, dto: UpdateContactChannelDto): Promise<ContactChannel> {
    await this.findById(id);
    const updated = await this.model.update(id, dto);
    if (!updated) throw new NotFoundException(`Kontak dengan id ${id} tidak ditemukan`);
    invalidateCache(CACHE_KEY);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.model.delete(id);
    invalidateCache(CACHE_KEY);
  }
}
