import { Module } from '@nestjs/common';
import { SocialMediaController } from './social-media.controller';
import { SocialMediaService } from './social-media.service';
import { SocialMediaModel } from '../../models/social-media.model';

@Module({
  controllers: [SocialMediaController],
  providers: [SocialMediaService, SocialMediaModel],
})
export class SocialMediaModule {}
