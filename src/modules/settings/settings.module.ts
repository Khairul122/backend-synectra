import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsModel } from '../../models/settings.model';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, SettingsModel],
  exports: [SettingsModel],
})
export class SettingsModule {}
