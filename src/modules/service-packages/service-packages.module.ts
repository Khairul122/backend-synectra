import { Module } from '@nestjs/common';
import { ServicePackagesController } from './service-packages.controller';
import { ServicePackagesService } from './service-packages.service';
import { ServicePackageModel } from '../../models/service-package.model';

@Module({
  controllers: [ServicePackagesController],
  providers: [ServicePackagesService, ServicePackageModel],
})
export class ServicePackagesModule {}
