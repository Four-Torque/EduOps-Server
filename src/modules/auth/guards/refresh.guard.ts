import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ApiException, ErrorCode, JWT_REFRESH_SECRET_KEY } from 'src/global';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    if (!token) throw new ApiException(ErrorCode.UNAUTHORIZED);
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: JWT_REFRESH_SECRET_KEY,
      });
      request['user'] = payload;
    } catch (error) {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }
    return true;
  }

  private extractTokenFromCookie(request: Request) {
    const token = request.cookies?.['eo_rtk'];
    if (!token) {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }
    return token;
  }
}
