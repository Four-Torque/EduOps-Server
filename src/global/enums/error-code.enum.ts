import { HttpStatus } from '@nestjs/common';

export enum ErrorCode {
  // 일반적인 에러
  INTERNAL_SERVER_ERROR = 'SERVER_001',
  BAD_REQUEST = 'COMMON_001',
  FORBIDDEN = 'COMMON_002',
  UNAUTHORIZED = 'COMMON_003',

  // 인증 관련 에러
  VERIFICATION_FAILED = 'AUTH_001',
  VERIFICATION_TOKEN_INVALID = 'AUTH_002',
  INVALID_EMAIL_OR_PASSWORD = 'AUTH_003',

  // 사용자 관련 에러
  USER_NOT_FOUND = 'USER_001',
  USER_ALREADY_EXISTS = 'USER_002',
}

export const ErrorCodeMap: Record<
  ErrorCode,
  { status: HttpStatus; message: string }
> = {
  // 일반적인 에러
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: '서버 내부 오류가 발생했습니다.',
  },
  [ErrorCode.BAD_REQUEST]: {
    status: HttpStatus.BAD_REQUEST,
    message: '잘못된 요청입니다.',
  },
  [ErrorCode.FORBIDDEN]: {
    status: HttpStatus.FORBIDDEN,
    message: '접근이 거부되었습니다.',
  },
  [ErrorCode.UNAUTHORIZED]: {
    status: HttpStatus.UNAUTHORIZED,
    message: '인증이 필요합니다.',
  },

  // 인증 관련 에러
  [ErrorCode.VERIFICATION_FAILED]: {
    status: HttpStatus.BAD_REQUEST,
    message: '이메일 인증에 실패했습니다.',
  },
  [ErrorCode.VERIFICATION_TOKEN_INVALID]: {
    status: HttpStatus.BAD_REQUEST,
    message: '인증 토큰이 유효하지 않습니다.',
  },
  [ErrorCode.INVALID_EMAIL_OR_PASSWORD]: {
    status: HttpStatus.UNAUTHORIZED,
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
  },

  // 사용자 관련 에러
  [ErrorCode.USER_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '사용자를 찾을 수 없습니다.',
  },
  [ErrorCode.USER_ALREADY_EXISTS]: {
    status: HttpStatus.CONFLICT,
    message: '이미 존재하는 사용자입니다.',
  },
};
