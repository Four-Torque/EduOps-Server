export enum ResponseMessage {
  VERIFICATION_EMAIL_SENT = '인증 이메일이 발송되었습니다. 이메일을 확인해주세요.',
  VERIFICATION_SUCCESS = '인증이 성공적으로 완료되었습니다.',
  PASSWORD_RESET_SUCCESS = '비밀번호가 성공적으로 재설정되었습니다.',

  // 급여 관련
  SALARY_CREATED = '급여가 성공적으로 생성되었습니다.',
  SALARY_PAID = '급여가 성공적으로 지급되었습니다.',
  SALARY_UPDATED = '급여가 성공적으로 업데이트되었습니다.',
  SALARY_FETCHED = '급여가 성공적으로 조회되었습니다.',

  // 직원 근태 / 학생 출결 관련
  ATTENDANCE_FETCHED = '직원 근태 / 학생 출결이 성공적으로 조회되었습니다.',
  ATTENDANCE_CHECKED_IN = '직원 체크인이 성공적으로 완료되었습니다.',
  ATTENDANCE_UPDATED = '직원 근태 / 학생 출결이 성공적으로 업데이트되었습니다.',
  ATTENDANCE_CREATED = '학생 출결이 성공적으로 생성되었습니다.',

  // 유저 관련
  USER_LIST_FETCHED = '유저 목록이 성공적으로 조회되었습니다.',
  USER_FETCHED = '유저 상세정보가 성공적으로 조회되었습니다.',
  USER_CREATED = '유저가 성공적으로 생성되었습니다.',
  USER_UPDATED = '유저 정보가 성공적으로 업데이트되었습니다.',
  USER_DELETED = '유저가 성공적으로 삭제되었습니다.',

  // 학생 관련
  STUDENT_LIST_FETCHED = '학생 목록이 성공적으로 조회되었습니다.',
  STUDENT_FETCHED = '학생 상세정보가 성공적으로 조회되었습니다.',
  STUDENT_CREATED = '학생이 성공적으로 생성되었습니다.',
  STUDENT_UPDATED = '학생 정보가 성공적으로 업데이트되었습니다.',
  STUDENT_DELETED = '학생이 성공적으로 삭제되었습니다.',

  // 구매처 관련
  VENDOR_CREATED = '구매처가 성공적으로 생성되었습니다.',
  VENDOR_UPDATED = '구매처 정보가 성공적으로 업데이트되었습니다.',
  VENDOR_DELETED = '구매처가 성공적으로 삭제되었습니다.',
}
