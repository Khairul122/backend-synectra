import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserModel } from '../../models/user.model';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly userModel: UserModel) {}

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const record = await this.userModel.findByIdWithPassword(userId);
    if (!record) throw new NotFoundException(`User dengan id ${userId} tidak ditemukan`);
    const hash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await this.userModel.updatePassword(userId, hash);
  }
}
