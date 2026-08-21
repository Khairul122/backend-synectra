import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServiceModel } from '../../models/service.model';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService, ServiceModel],
  exports: [ServiceModel],
})
export class ServicesModule {}
