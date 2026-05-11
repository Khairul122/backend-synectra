import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactChannelModel } from '../../models/contact-channel.model';
import { ContactChannel } from '../../types/contact-channel.types';
import { CreateContactChannelDto } from './dto/create-contact-channel.dto';
import { UpdateContactChannelDto } from './dto/update-contact-channel.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly model: ContactChannelModel) {}

  findAll(): Promise<ContactChannel[]> {
    return this.model.findAll();
  }

  async findById(id: string): Promise<ContactChannel> {
    const item = await this.model.findById(id);
    if (!item) throw new NotFoundException(`Kontak dengan id ${id} tidak ditemukan`);
    return item;
  }

  create(dto: CreateContactChannelDto): Promise<ContactChannel> {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateContactChannelDto): Promise<ContactChannel> {
    await this.findById(id);
    const updated = await this.model.update(id, dto);
    if (!updated) throw new NotFoundException(`Kontak dengan id ${id} tidak ditemukan`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.model.delete(id);
  }
}
