import { Module } from '@nestjs/common';
import { SoftwareProductsController } from './software-products.controller';
import { SoftwareProductsService } from './software-products.service';
import { SoftwareProductModel } from '../../models/software-product.model';

@Module({
  controllers: [SoftwareProductsController],
  providers: [SoftwareProductsService, SoftwareProductModel],
  exports: [SoftwareProductModel],
})
export class SoftwareProductsModule {}
