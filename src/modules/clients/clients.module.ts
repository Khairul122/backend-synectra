import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientModel } from '../../models/client.model';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, ClientModel],
})
export class ClientsModule {}
