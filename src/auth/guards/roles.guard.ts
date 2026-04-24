import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ForbiddenError } from '../../common/errors/app.error';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../generated/prisma/enums';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireRoles?.length) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!requireRoles.includes(user.role)) {
      throw new ForbiddenError(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
