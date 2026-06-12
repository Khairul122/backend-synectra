import { Injectable, NotFoundException } from '@nestjs/common';
import { SoftwareProductModel } from '../../models/software-product.model';
import { SoftwareProduct } from '../../types/software-product.types';
import { CreateSoftwareProductDto } from './dto/create-software-product.dto';
import { UpdateSoftwareProductDto } from './dto/update-software-product.dto';
import { cached, invalidateCache } from '../../common/utils/memory-cache';

const CACHE_KEY = 'software-products:findAll';
const CACHE_KEY_ACTIVE = 'software-products:findAllActive';
const CACHE_TTL = 60_000;

@Injectable()
export class SoftwareProductsService {
  constructor(private readonly softwareProductModel: SoftwareProductModel) {}

  findAll(): Promise<SoftwareProduct[]> {
    return cached(CACHE_KEY, CACHE_TTL, () => this.softwareProductModel.findAll());
  }

  findAllActive(): Promise<SoftwareProduct[]> {
    return cached(CACHE_KEY_ACTIVE, CACHE_TTL, () => this.softwareProductModel.findAllActive());
  }

  async findById(id: string): Promise<SoftwareProduct> {
    const product = await this.softwareProductModel.findById(id);
    if (!product) throw new NotFoundException(`Software dengan id ${id} tidak ditemukan`);
    return product;
  }

  async create(dto: CreateSoftwareProductDto): Promise<SoftwareProduct> {
    const product = await this.softwareProductModel.create(dto);
    invalidateCache(CACHE_KEY);
    invalidateCache(CACHE_KEY_ACTIVE);
    return product;
  }

  async update(id: string, dto: UpdateSoftwareProductDto): Promise<SoftwareProduct> {
    await this.findById(id);
    const updated = await this.softwareProductModel.update(id, dto);
    if (!updated) throw new NotFoundException(`Software dengan id ${id} tidak ditemukan`);
    invalidateCache(CACHE_KEY);
    invalidateCache(CACHE_KEY_ACTIVE);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.softwareProductModel.delete(id);
    invalidateCache(CACHE_KEY);
    invalidateCache(CACHE_KEY_ACTIVE);
  }
}
