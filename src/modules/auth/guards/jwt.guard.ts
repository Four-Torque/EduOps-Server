import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import {
  ApiException,
  ErrorCode,
  IS_PUBLIC_KEY,
  JWT_SECRET_KEY,
} from 'src/global';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    if (!token) throw new ApiException(ErrorCode.UNAUTHORIZED);
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: JWT_SECRET_KEY,
      });
      request['user'] = payload;
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
