import { Module } from '@nestjs/common';
import { SoftwarePurchasesController } from './software-purchases.controller';
import { SoftwarePurchasesService } from './software-purchases.service';
import { SoftwarePurchaseModel } from '../../models/software-purchase.model';
import { SoftwareProductsModule } from '../software-products/software-products.module';

@Module({
  imports: [SoftwareProductsModule],
  controllers: [SoftwarePurchasesController],
  providers: [SoftwarePurchasesService, SoftwarePurchaseModel],
})
export class SoftwarePurchasesModule {}
