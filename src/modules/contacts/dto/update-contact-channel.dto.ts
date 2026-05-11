import { PartialType } from '@nestjs/swagger';
import { CreateContactChannelDto } from './create-contact-channel.dto';

export class UpdateContactChannelDto extends PartialType(CreateContactChannelDto) {}
