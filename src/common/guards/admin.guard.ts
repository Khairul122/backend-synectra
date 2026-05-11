import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AUTH_MESSAGES } from '../../constants';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.role !== 'admin') {
      throw new ForbiddenException(AUTH_MESSAGES.FORBIDDEN);
    }

    return true;
  }
}
