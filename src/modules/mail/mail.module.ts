import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ContactChannelModel } from '../../models/contact-channel.model';

@Module({
  providers: [MailService, ContactChannelModel],
  exports:   [MailService],
})
export class MailModule {}
