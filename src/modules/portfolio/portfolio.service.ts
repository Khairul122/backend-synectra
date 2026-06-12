import { Injectable, NotFoundException } from '@nestjs/common';
import { PortfolioModel } from '../../models/portfolio.model';
import { Portfolio } from '../../types/portfolio.types';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { cached, invalidateCache } from '../../common/utils/memory-cache';

const CACHE_KEY = 'portfolio:findAll';
const CACHE_TTL = 60_000;

@Injectable()
export class PortfolioService {
  constructor(private portfolioModel: PortfolioModel) {}

  findAll(): Promise<Portfolio[]> {
    return cached(CACHE_KEY, CACHE_TTL, () => this.portfolioModel.findAll());
  }

  async findById(id: string): Promise<Portfolio> {
    const item = await this.portfolioModel.findById(id);
    if (!item) throw new NotFoundException(`Portfolio dengan id ${id} tidak ditemukan`);
    return item;
  }

  async create(dto: CreatePortfolioDto): Promise<Portfolio> {
    const item = await this.portfolioModel.create(dto);
    invalidateCache(CACHE_KEY);
    return item;
  }

  async update(id: string, dto: UpdatePortfolioDto): Promise<Portfolio> {
    const item = await this.portfolioModel.update(id, dto);
    if (!item) throw new NotFoundException(`Portfolio dengan id ${id} tidak ditemukan`);
    invalidateCache(CACHE_KEY);
    return item;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.portfolioModel.delete(id);
    invalidateCache(CACHE_KEY);
  }
}
