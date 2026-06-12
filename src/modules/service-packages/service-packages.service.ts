import { Injectable, NotFoundException } from '@nestjs/common';
import { ServicePackageModel } from '../../models/service-package.model';
import { ServicePackage } from '../../types/service-package.types';
import { CreateServicePackageDto } from './dto/create-service-package.dto';
import { UpdateServicePackageDto } from './dto/update-service-package.dto';
import { cached, invalidateCache } from '../../common/utils/memory-cache';

const CACHE_KEY = 'service-packages:findAll';
const CACHE_KEY_ACTIVE = 'service-packages:findAllActive';
const CACHE_TTL = 60_000;

@Injectable()
export class ServicePackagesService {
  constructor(private readonly servicePackageModel: ServicePackageModel) {}

  findAll(): Promise<ServicePackage[]> {
    return cached(CACHE_KEY, CACHE_TTL, () => this.servicePackageModel.findAll());
  }

  findAllActive(): Promise<ServicePackage[]> {
    return cached(CACHE_KEY_ACTIVE, CACHE_TTL, () => this.servicePackageModel.findAllActive());
  }

  async findById(id: string): Promise<ServicePackage> {
    const pkg = await this.servicePackageModel.findById(id);
    if (!pkg) throw new NotFoundException(`Paket layanan dengan id ${id} tidak ditemukan`);
    return pkg;
  }

  async create(dto: CreateServicePackageDto): Promise<ServicePackage> {
    const pkg = await this.servicePackageModel.create(dto);
    invalidateCache(CACHE_KEY);
    invalidateCache(CACHE_KEY_ACTIVE);
    return pkg;
  }

  async update(id: string, dto: UpdateServicePackageDto): Promise<ServicePackage> {
    await this.findById(id);
    const updated = await this.servicePackageModel.update(id, dto);
    if (!updated) throw new NotFoundException(`Paket layanan dengan id ${id} tidak ditemukan`);
    invalidateCache(CACHE_KEY);
    invalidateCache(CACHE_KEY_ACTIVE);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.servicePackageModel.delete(id);
    invalidateCache(CACHE_KEY);
    invalidateCache(CACHE_KEY_ACTIVE);
  }
}
