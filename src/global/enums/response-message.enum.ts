export enum ResponseMessage {
  VERIFICATION_EMAIL_SENT = '인증 이메일이 발송되었습니다. 이메일을 확인해주세요.',
  VERIFICATION_SUCCESS = '인증이 성공적으로 완료되었습니다.',
  PASSWORD_RESET_SUCCESS = '비밀번호가 성공적으로 재설정되었습니다.',

  // 급여 관련
  SALARY_CREATED = '급여가 성공적으로 생성되었습니다.',
  SALARY_PAID = '급여가 성공적으로 지급되었습니다.',
  SALARY_UPDATED = '급여가 성공적으로 업데이트되었습니다.',
  SALARY_FETCHED = '급여가 성공적으로 조회되었습니다.',

  // 직원 근태 관련
  ATTENDANCE_FETCHED = '직원 근태가 성공적으로 조회되었습니다.',
  ATTENDANCE_CHECKED_IN = '직원 체크인이 성공적으로 완료되었습니다.',
  ATTENDANCE_UPDATED = '직원 근태가 성공적으로 업데이트되었습니다.',
}
