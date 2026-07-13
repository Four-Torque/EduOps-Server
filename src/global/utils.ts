import { Response } from 'express';
import { JWT_REFRESH_EXPIRES_IN, JWT_SECRET_EXPIRES_IN, NODE_ENV } from '.';
import { format, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';

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

export function clearCookies(res: Response) {
  res.clearCookie('eo_atk', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.clearCookie('eo_rtk', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(d)) return '';
  return format(d, 'yyyy-MM-dd', { locale: ko });
}
