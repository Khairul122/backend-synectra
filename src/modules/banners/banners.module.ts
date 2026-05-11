import { Module } from '@nestjs/common';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { BannerModel } from '../../models/banner.model';

@Module({
  controllers: [BannersController],
  providers: [BannersService, BannerModel],
})
export class BannersModule {}
