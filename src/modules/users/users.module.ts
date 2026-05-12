import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserModel } from '../../models/user.model';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserModel],
})
export class UsersModule {}
