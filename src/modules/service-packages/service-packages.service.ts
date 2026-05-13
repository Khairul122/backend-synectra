import { Injectable, NotFoundException } from '@nestjs/common';
import { ServicePackageModel } from '../../models/service-package.model';
import { ServicePackage } from '../../types/service-package.types';
import { CreateServicePackageDto } from './dto/create-service-package.dto';
import { UpdateServicePackageDto } from './dto/update-service-package.dto';

@Injectable()
export class ServicePackagesService {
  constructor(private readonly servicePackageModel: ServicePackageModel) {}

  findAll(): Promise<ServicePackage[]> {
    return this.servicePackageModel.findAll();
  }

  findAllActive(): Promise<ServicePackage[]> {
    return this.servicePackageModel.findAllActive();
  }

  async findById(id: string): Promise<ServicePackage> {
    const pkg = await this.servicePackageModel.findById(id);
    if (!pkg) throw new NotFoundException(`Paket layanan dengan id ${id} tidak ditemukan`);
    return pkg;
  }

  create(dto: CreateServicePackageDto): Promise<ServicePackage> {
    return this.servicePackageModel.create(dto);
  }

  async update(id: string, dto: UpdateServicePackageDto): Promise<ServicePackage> {
    await this.findById(id);
    const updated = await this.servicePackageModel.update(id, dto);
    if (!updated) throw new NotFoundException(`Paket layanan dengan id ${id} tidak ditemukan`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.servicePackageModel.delete(id);
  }
}
