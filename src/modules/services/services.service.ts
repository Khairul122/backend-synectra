import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceModel } from '../../models/service.model';
import { Service } from '../../types/service.types';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { cached, invalidateCache } from '../../common/utils/memory-cache';

const CACHE_KEY = 'services:findAll';
const CACHE_KEY_ACTIVE = 'services:findAllActive';
const CACHE_TTL = 60_000;

@Injectable()
export class ServicesService {
  constructor(private readonly serviceModel: ServiceModel) {}

  findAll(): Promise<Service[]> {
    return cached(CACHE_KEY, CACHE_TTL, () => this.serviceModel.findAll());
  }

  findAllActive(): Promise<Service[]> {
    return cached(CACHE_KEY_ACTIVE, CACHE_TTL, () => this.serviceModel.findAllActive());
  }

  async findById(id: string): Promise<Service> {
    const service = await this.serviceModel.findById(id);
    if (!service) throw new NotFoundException(`Layanan dengan id ${id} tidak ditemukan`);
    return service;
  }

  async create(dto: CreateServiceDto): Promise<Service> {
    const service = await this.serviceModel.create(dto);
    invalidateCache(CACHE_KEY);
    invalidateCache(CACHE_KEY_ACTIVE);
    return service;
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    await this.findById(id);
    const updated = await this.serviceModel.update(id, dto);
    if (!updated) throw new NotFoundException(`Layanan dengan id ${id} tidak ditemukan`);
    invalidateCache(CACHE_KEY);
    invalidateCache(CACHE_KEY_ACTIVE);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.serviceModel.delete(id);
    invalidateCache(CACHE_KEY);
    invalidateCache(CACHE_KEY_ACTIVE);
  }
}
