import { Response } from 'express';
import { JWT_REFRESH_EXPIRES_IN, JWT_SECRET_EXPIRES_IN, NODE_ENV } from '.';
import { format, isValid, parseISO } from 'date-fns';
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

/**
 * 'YYYY-MM-DD' 날짜 문자열(Asia/Seoul 기준 하루)을 그 하루 전체를 포함하는 UTC 조회 경계로 변환한다.
 * 프론트는 KST 달력 기준으로 startDate/endDate를 보내지만, `new Date('2026-07-31')`은
 * UTC 자정(그날의 '시작')으로 파싱되어 종료일 하루치가 통째로 누락된다. 이를 KST 하루 경계로 맞춘다.
 * @returns gte(시작일 00:00 KST) 이상, lt(종료일 다음날 00:00 KST) 미만
 */
export function toKstDateRange(startDate: string, endDate: string) {
  const KST_OFFSET = '+09:00';
  const gte = new Date(`${startDate}T00:00:00${KST_OFFSET}`);
  const endDayStart = new Date(`${endDate}T00:00:00${KST_OFFSET}`);
  const lt = new Date(endDayStart.getTime() + 24 * 60 * 60 * 1000);
  return { gte, lt };
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

export function formatDate(
  date: Date | string | null | undefined,
  type?: 'HH' | 'mm' | 'ss',
): string {
  if (!date) return '';

  const d = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(d)) return '';

  if (type === 'HH') {
    return format(d, 'HH', { locale: ko });
  }
  if (type === 'ss') {
    return format(d, 'ss', { locale: ko });
  }

  if (type === 'mm') {
    return format(d, 'mm', { locale: ko });
  }

  return format(d, 'yyyy-MM-dd', { locale: ko });
}
