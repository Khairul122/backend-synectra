import { Injectable, NotFoundException } from '@nestjs/common';
import { BankAccountModel } from '../../models/bank-account.model';
import { BankAccount } from '../../types/bank-account.types';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(private readonly bankAccountModel: BankAccountModel) {}

  findAll(): Promise<BankAccount[]> {
    return this.bankAccountModel.findAll();
  }

  async findById(id: string): Promise<BankAccount> {
    const account = await this.bankAccountModel.findById(id);
    if (!account) throw new NotFoundException(`Akun bank dengan id ${id} tidak ditemukan`);
    return account;
  }

  create(dto: CreateBankAccountDto): Promise<BankAccount> {
    return this.bankAccountModel.create(dto);
  }

  async update(id: string, dto: UpdateBankAccountDto): Promise<BankAccount> {
    await this.findById(id);
    const updated = await this.bankAccountModel.update(id, dto);
    if (!updated) throw new NotFoundException(`Akun bank dengan id ${id} tidak ditemukan`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.bankAccountModel.delete(id);
  }
}
