import { Module } from '@nestjs/common';
import { BankAccountsController } from './bank-accounts.controller';
import { BankAccountsService } from './bank-accounts.service';
import { BankAccountModel } from '../../models/bank-account.model';

@Module({
  controllers: [BankAccountsController],
  providers: [BankAccountsService, BankAccountModel],
})
export class BankAccountsModule {}
