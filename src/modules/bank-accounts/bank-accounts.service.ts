import { Injectable, NotFoundException } from '@nestjs/common';
import { BankAccountModel } from '../../models/bank-account.model';
import { BankAccount } from '../../types/bank-account.types';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { cached, invalidateCache } from '../../common/utils/memory-cache';

const CACHE_KEY = 'bank-accounts:findAll';
const CACHE_TTL = 60_000;

@Injectable()
export class BankAccountsService {
  constructor(private readonly bankAccountModel: BankAccountModel) {}

  findAll(): Promise<BankAccount[]> {
    return cached(CACHE_KEY, CACHE_TTL, () => this.bankAccountModel.findAll());
  }

  async findById(id: string): Promise<BankAccount> {
    const account = await this.bankAccountModel.findById(id);
    if (!account) throw new NotFoundException(`Akun bank dengan id ${id} tidak ditemukan`);
    return account;
  }

  async create(dto: CreateBankAccountDto): Promise<BankAccount> {
    const account = await this.bankAccountModel.create(dto);
    invalidateCache(CACHE_KEY);
    return account;
  }

  async update(id: string, dto: UpdateBankAccountDto): Promise<BankAccount> {
    await this.findById(id);
    const updated = await this.bankAccountModel.update(id, dto);
    if (!updated) throw new NotFoundException(`Akun bank dengan id ${id} tidak ditemukan`);
    invalidateCache(CACHE_KEY);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.bankAccountModel.delete(id);
    invalidateCache(CACHE_KEY);
  }
}
