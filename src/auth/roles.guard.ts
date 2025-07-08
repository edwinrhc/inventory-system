import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role } from '../users/role.enum';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required) return true;

    const { user } = ctx.switchToHttp().getRequest();
    return required.includes(user.role);
  }
}
