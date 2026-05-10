import { Injectable, NotFoundException } from '@nestjs/common';
import { PortfolioModel } from '../../models/portfolio.model';
import { Portfolio } from '../../types/portfolio.types';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(private portfolioModel: PortfolioModel) {}

  findAll(): Promise<Portfolio[]> {
    return this.portfolioModel.findAll();
  }

  async findById(id: string): Promise<Portfolio> {
    const item = await this.portfolioModel.findById(id);
    if (!item) throw new NotFoundException(`Portfolio dengan id ${id} tidak ditemukan`);
    return item;
  }

  create(dto: CreatePortfolioDto): Promise<Portfolio> {
    return this.portfolioModel.create(dto);
  }

  async update(id: string, dto: UpdatePortfolioDto): Promise<Portfolio> {
    const item = await this.portfolioModel.update(id, dto);
    if (!item) throw new NotFoundException(`Portfolio dengan id ${id} tidak ditemukan`);
    return item;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.portfolioModel.delete(id);
  }
}
