import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientModel, Client } from '../../models/client.model';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly clientModel: ClientModel) {}

  findAll(): Promise<Client[]> {
    return this.clientModel.findAll();
  }

  async findById(id: string): Promise<Client> {
    const client = await this.clientModel.findById(id);
    if (!client) throw new NotFoundException(`Client dengan id ${id} tidak ditemukan`);
    return client;
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    await this.findById(id);
    const updated = await this.clientModel.update(id, dto);
    if (!updated) throw new NotFoundException(`Client dengan id ${id} tidak ditemukan`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.clientModel.delete(id);
  }
}
