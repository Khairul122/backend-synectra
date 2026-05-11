import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { ContactChannelModel } from '../../models/contact-channel.model';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, ContactChannelModel],
})
export class ContactsModule {}
