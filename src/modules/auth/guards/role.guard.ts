import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { ApiException, ErrorCode, JWT_SECRET_KEY } from 'src/global';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);
    if (!token) throw new ApiException(ErrorCode.UNAUTHORIZED);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: JWT_SECRET_KEY,
      });

      if (!roles.includes(payload.role)) {
        throw new ApiException(ErrorCode.UNAUTHORIZED);
      }
    } catch (error) {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }

    return true;
  }

  private extractTokenFromCookie(request: Request) {
    const token = request.cookies?.['eo_atk'];
    if (!token) {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }
    return token;
  }
}
