import { Response } from 'express';
import { JWT_REFRESH_EXPIRES_IN, JWT_SECRET_EXPIRES_IN, NODE_ENV } from '.';

export function setCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie('eo_atk', accessToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: JWT_SECRET_EXPIRES_IN * 1000,
  });
  res.cookie('eo_rtk', refreshToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: JWT_REFRESH_EXPIRES_IN * 1000,
  });
}
