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
  REFRESH_TOKEN_NOT_FOUND = 'AUTH_004',
  INVALID_REFRESH_TOKEN = 'AUTH_005',

  // 사용자 관련 에러
  USER_NOT_FOUND = 'USER_001',
  USER_ALREADY_EXISTS = 'USER_002',
  PHONE_ALREADY_EXISTS = 'USER_003',

  // 급여 관련 에러
  SALARY_NOT_FOUND = 'SALARY_001',
  SALARY_ALREADY_PAID = 'SALARY_002',

  // 직원 근태 / 학생 출결 관련 에러
  ATTENDANCE_NOT_FOUND = 'ATTENDANCE_001',
  ATTENDANCE_ALREADY_EXISTS = 'ATTENDANCE_002',
  ATTENDANCE_ALREADY_CHECKED_OUT = 'ATTENDANCE_003',

  // 학생 관련 에러
  STUDENT_NOT_FOUND = 'STUDENT_001',
  STUDENT_ALREADY_EXISTS = 'STUDENT_002',
  STUDENT_ALREADY_ENROLLED = 'STUDENT_003',

  // 구매처 관련 에러
  VENDOR_NOT_FOUND = 'VENDOR_001',

  // 강좌 관련 에러
  CLASS_NOT_FOUND = 'CLASS_001',
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
    status: HttpStatus.BAD_REQUEST,
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
  },
  [ErrorCode.REFRESH_TOKEN_NOT_FOUND]: {
    status: HttpStatus.UNAUTHORIZED,
    message: '리프레시 토큰을 찾을 수 없습니다.',
  },
  [ErrorCode.INVALID_REFRESH_TOKEN]: {
    status: HttpStatus.UNAUTHORIZED,
    message: '리프레시 토큰이 유효하지 않습니다.',
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
  [ErrorCode.PHONE_ALREADY_EXISTS]: {
    status: HttpStatus.CONFLICT,
    message: '이미 존재하는 전화번호입니다.',
  },

  // 급여 관련 에러
  [ErrorCode.SALARY_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '급여를 찾을 수 없습니다.',
  },
  [ErrorCode.SALARY_ALREADY_PAID]: {
    status: HttpStatus.BAD_REQUEST,
    message: '급여가 이미 지급되었습니다.',
  },

  // 직원 근태 관련 에러
  [ErrorCode.ATTENDANCE_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '근태를 찾을 수 없습니다.',
  },
  [ErrorCode.ATTENDANCE_ALREADY_EXISTS]: {
    status: HttpStatus.CONFLICT,
    message: '이미 존재하는 근태입니다.',
  },
  [ErrorCode.ATTENDANCE_ALREADY_CHECKED_OUT]: {
    status: HttpStatus.BAD_REQUEST,
    message: '이미 체크아웃된 근태입니다.',
  },

  // 학생 관련 에러
  [ErrorCode.STUDENT_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '학생을 찾을 수 없습니다.',
  },
  [ErrorCode.STUDENT_ALREADY_EXISTS]: {
    status: HttpStatus.CONFLICT,
    message: '이미 존재하는 학생입니다.',
  },
  [ErrorCode.STUDENT_ALREADY_ENROLLED]: {
    status: HttpStatus.BAD_REQUEST,
    message: '이미 등록된 학생입니다.',
  },

  // 구매처 관련 에러
  [ErrorCode.VENDOR_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '해당 구매처를 찾을 수 없습니다.',
  },

  // 클래스 관런 에러
  [ErrorCode.CLASS_NOT_FOUND]: {
    status: HttpStatus.NOT_FOUND,
    message: '해당 강좌를 찾을 수 없습니다.',
  },
};
