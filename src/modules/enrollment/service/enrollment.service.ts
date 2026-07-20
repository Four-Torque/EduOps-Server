import { Injectable } from '@nestjs/common';
import { EnrollmentRepository } from '../repository/enrollment.repository';
import { CreateEnrollmentRequest } from '../request/create-enrollment.request';
import { EnrollmentResponse } from '../response/enrollment.response';
import { PaymentService } from '../../payment/service/payment.service';
import { ClassRepository } from '../../class/repository/class.repository';
import { StudentRepository } from '../../student/repository/student.repository';
import { ApiException, ErrorCode } from 'src/global';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly paymentService: PaymentService,
    private readonly classRepository: ClassRepository,
    private readonly studentRepository: StudentRepository,
  ) {}

  /**
   * create 메서드는 등록 정보와 결제 정보를 생성합니다.
   * @param request
   * @returns
   */
  async create(request: CreateEnrollmentRequest): Promise<EnrollmentResponse> {
    // 중복 수강 등록 확인
    const existingEnrollment =
      await this.enrollmentRepository.findByStudentAndClass(
        request.studentId,
        request.classId,
      );
    if (existingEnrollment) {
      throw new ApiException(ErrorCode.STUDENT_ALREADY_ENROLLED);
    }

    // 학생 존재 여부 확인
    const student = await this.studentRepository.findById(request.studentId);
    if (!student) {
      throw new ApiException(ErrorCode.STUDENT_NOT_FOUND);
    }

    // 강좌 정보 조회 (정가 및 시간표 확인용)
    const cls = await this.classRepository.findById(request.classId);
    if (!cls) {
      throw new ApiException(ErrorCode.CLASS_NOT_FOUND);
    }

    // 정원 초과 확인 (capacity가 0보다 클 때만 정원이 있는 것으로 간주)
    if (cls.capacity > 0) {
      const currentEnrollments = (cls as any)._count?.enrollments || 0;
      if (currentEnrollments >= cls.capacity) {
        throw new ApiException(ErrorCode.CLASS_CAPACITY_EXCEEDED);
      }
    }



    // 학생 시간표 충돌 확인
    const schedules: any[] = (cls as any).schedules || [];
    if (schedules.length > 0) {
      const existingSchedules = await this.enrollmentRepository.findSchedulesByStudentId(request.studentId);
      
      for (const newSchedule of schedules) {
        for (const existingSchedule of existingSchedules) {
          if (newSchedule.dayOfWeek === existingSchedule.dayOfWeek) {
            // 시간 겹침 유효성 검사: (새 시작시간 < 기존 종료시간) && (새 종료시간 > 기존 시작시간)
            if (newSchedule.startTime < existingSchedule.endTime && newSchedule.endTime > existingSchedule.startTime) {
              throw new ApiException(ErrorCode.STUDENT_SCHEDULE_CONFLICT);
            }
          }
        }
      }
    }

    // 수강 데이터 생성
    const enrollmentData = CreateEnrollmentRequest.toEntity(request);
    const createdEnrollment =
      await this.enrollmentRepository.create(enrollmentData);

    // 첫 결제(청구서) 자동 생성 로직
    // 클라이언트가 넘겨준 값이 있으면 그것을 사용, 없으면 강좌 정가 사용
    const billingAmount =
      request.initialAmount !== undefined ? request.initialAmount : cls.fee;

    // 납부 기한이 없으면 기본값으로 수강 시작일 기준 + 7일 설정
    let dueDate = request.initialDueDate;
    if (!dueDate) {
      dueDate = new Date(request.enrollDate);
      dueDate.setDate(dueDate.getDate() + 7);
    }

    // 청구서 제목 자동 생성 (예: "23년11월-수학영재반-홍길동")
    const enrollDateObj = new Date(request.enrollDate);
    const yy = enrollDateObj.getFullYear().toString().slice(-2);
    const mm = (enrollDateObj.getMonth() + 1).toString().padStart(2, '0');
    const paymentTitle = `${yy}년${mm}월-${cls.name}-${student.name}`;

    await this.paymentService.create({
      studentId: request.studentId,
      classId: request.classId,
      title: paymentTitle,
      amount: billingAmount,
      dueDate: dueDate,
      // paymentType은 CreatePaymentRequest 내부 로직에 의해 자동으로 기본값 UNPAID로 설정됩니다.
    });

    // 5. 생성된 수강 정보 응답용으로 재조회하여 반환
    const enrollmentWithRelations = await this.enrollmentRepository.findById(
      createdEnrollment.id,
    );

    return EnrollmentResponse.fromEntity(enrollmentWithRelations as any);
  }

  /**
   * findAll 메서드는 학생ID와 강좌ID로 등록 데이터 리스트를 조회합니다.
   * @param studentId
   * @param classId
   * @returns
   */
  async findAll(
    studentId?: string,
    classId?: string,
  ): Promise<EnrollmentResponse[]> {
    const data = await this.enrollmentRepository.findAll(studentId, classId);
    return data.map((enrollment) =>
      EnrollmentResponse.fromEntity(enrollment as any),
    );
  }

  /**
   * delete 메서드는 id로 해당 등록 정보와 미납 결제 정보를 삭제합니다.
   * @param id
   */
  async delete(id: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) {
      throw new ApiException(ErrorCode.ENROLLMENT_NOT_FOUND);
    }

    // 수강을 취소할 때, 아직 내지 않은 해당 강좌의 미납(UNPAID) 청구서만 깔끔하게 일괄 삭제합니다.
    // (이미 낸 돈(PAID)이나 환불된 돈(REFUNDED) 등은 회계상 보존되어야 하므로 건드리지 않습니다.)
    await this.paymentService.deleteUnpaidPayments(
      enrollment.studentId,
      enrollment.classId,
    );

    // 수강 내역 삭제 처리
    await this.enrollmentRepository.delete(id);
  }
}
