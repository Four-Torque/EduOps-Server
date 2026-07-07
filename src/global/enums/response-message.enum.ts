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

  // 강좌 관련
  CLASS_CREATED = '강좌가 성공적으로 생성되었습니다.',
  CLASS_FETCHED = '강좌가 성공적으로 조회되었습니다.',
  CLASS_UPDATED = '강좌가 성공적으로 업데이트되었습니다.',

  // 카테고리 관련
  CATEGORY_CREATED = '카테고리가 성공적으로 생성되었습니다.',
  CATEGORY_UPDATED = '카테고리 정보가 성공적으로 업데이트되었습니다.',
  CATEGORY_DELETED = '카테고리가 성공적으로 삭제되었습니다.',

  // 자산 관련
  ASSET_APPLICATION_CREATED = '자재 신청이 성공적으로 생성되었습니다.',
  ASSET_APPLICATION_STATUS_CHANGED = '자재 신청 상태가 성공적으로 변경되었습니다.',
  ASSET_APPLICATION_DELETED = '자재 신청이 성공적으로 삭제되었습니다.',
  // 결제 관련
  PAYMENT_CREATED = '결제가 성공적으로 생성되었습니다.',
  PAYMENT_UPDATED = '결제 정보가 성공적으로 업데이트되었습니다.',
  PAYMENT_FETCHED = '결제 정보가 성공적으로 조회되었습니다.',
  PAYMENT_DELETED = '결제가 성공적으로 삭제되었습니다.',

  // 수강 등록 관련
  ENROLLMENT_CREATED = '수강 등록이 성공적으로 완료되었습니다.',
  ENROLLMENT_FETCHED = '수강 내역이 성공적으로 조회되었습니다.',
  ENROLLMENT_DELETED = '수강 등록이 성공적으로 취소되었습니다.',

  // 시간표 관련
  SCHEDULE_CREATED = '시간표가 성공적으로 등록되었습니다.',
  SCHEDULE_FETCHED = '시간표가 성공적으로 조회되었습니다.',
  SCHEDULE_DELETED = '시간표가 성공적으로 삭제되었습니다.',

  // 시험 관련
  EXAM_CREATED = '시험이 성공적으로 생성되었습니다.',
  EXAM_FETCHED = '시험이 성공적으로 조회되었습니다.',
  EXAM_UPDATED = '시험이 성공적으로 수정되었습니다.',
  EXAM_DELETED = '시험이 성공적으로 삭제되었습니다.',
  EXAM_RESULT_SAVED = '시험 점수가 성공적으로 등록/수정되었습니다.',
  EXAM_RESULT_FETCHED = '시험 점수 목록이 성공적으로 조회되었습니다.',

  // 수업 파일 관련
  CLASS_FILE_UPLOADED = '수업 파일이 성공적으로 업로드되었습니다.',
  CLASS_FILE_FETCHED = '수업 파일 목록이 성공적으로 조회되었습니다.',
  CLASS_FILE_DELETED = '수업 파일이 성공적으로 삭제되었습니다.',

  // 강좌계획서 관련
  CLASS_SYLLABUS_CREATED = '강좌계획서가 성공적으로 제출되었습니다.',
  CLASS_SYLLABUS_FETCHED = '강좌계획서가 성공적으로 조회되었습니다.',
  CLASS_SYLLABUS_APPROVED = '강좌계획서가 성공적으로 승인되었습니다.',
  CLASS_SYLLABUS_REJECTED = '강좌계획서가 성공적으로 반려되었습니다.',

  // 쪽지/메시지 관련
  MESSAGE_CREATED = '쪽지가 성공적으로 전송되었습니다.',
  MESSAGE_FETCHED = '쪽지 내용이 성공적으로 조회되었습니다.',
  CONVERSATION_LIST_FETCHED = '대화방 목록이 성공적으로 조회되었습니다.',
  CONVERSATION_DELETED = '대화방 나가기가 성공적으로 완료되었습니다.',
  MESSAGE_DELETED = '쪽지가 성공적으로 삭제되었습니다.',
  UNREAD_COUNT_FETCHED = '안 읽은 쪽지 개수가 성공적으로 조회되었습니다.',
}
