import { Injectable, NotFoundException } from '@nestjs/common';
import { SoftwareProductModel } from '../../models/software-product.model';
import { SoftwareProduct } from '../../types/software-product.types';
import { CreateSoftwareProductDto } from './dto/create-software-product.dto';
import { UpdateSoftwareProductDto } from './dto/update-software-product.dto';

@Injectable()
export class SoftwareProductsService {
  constructor(private readonly softwareProductModel: SoftwareProductModel) {}

  findAll(): Promise<SoftwareProduct[]> {
    return this.softwareProductModel.findAll();
  }

  findAllActive(): Promise<SoftwareProduct[]> {
    return this.softwareProductModel.findAllActive();
  }

  async findById(id: string): Promise<SoftwareProduct> {
    const product = await this.softwareProductModel.findById(id);
    if (!product) throw new NotFoundException(`Software dengan id ${id} tidak ditemukan`);
    return product;
  }

  create(dto: CreateSoftwareProductDto): Promise<SoftwareProduct> {
    return this.softwareProductModel.create(dto);
  }

  async update(id: string, dto: UpdateSoftwareProductDto): Promise<SoftwareProduct> {
    await this.findById(id);
    const updated = await this.softwareProductModel.update(id, dto);
    if (!updated) throw new NotFoundException(`Software dengan id ${id} tidak ditemukan`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.softwareProductModel.delete(id);
  }
}
