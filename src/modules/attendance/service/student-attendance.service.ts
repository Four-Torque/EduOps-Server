import { Injectable } from '@nestjs/common';
import { StudentAttendanceRepository } from '../repository/student-attendance.repository';
import { CreateStudentAttendanceRequest } from '../request/create-student-attendance.request';
import { StudentAttendanceResponse } from '../response/student-attendance.response';
import { ApiException, ErrorCode } from 'src/global';
import { StudentAttendanceStatus } from '@prisma/client';
import { StudentService } from 'src/modules/student/service/student.service';

@Injectable()
export class StudentAttendanceService {
  constructor(
    private readonly studentAttendanceRepository: StudentAttendanceRepository,
  ) {}

  /**
   * create 메서드는 학생 출결을 생성합니다
   * @param request
   * @returns
   */
  async create(
    request: CreateStudentAttendanceRequest,
  ): Promise<StudentAttendanceResponse> {
    try {
      const { studentId, classId, lectureDate, status } = request;
      const today = new Date();
      const date = lectureDate
        ? lectureDate
        : today.toISOString().split('T')[0];

      const existing = await this.studentAttendanceRepository.findByStudentId(
        studentId,
        date,
      );
      if (existing.length > 0) {
        throw new ApiException(ErrorCode.ATTENDANCE_ALREADY_EXISTS);
      }
      // @TODO class 존재유무 파악도 필요할지도

      const data = CreateStudentAttendanceRequest.toEntity(request);
      const attendance = await this.studentAttendanceRepository.create(data);

      const response: StudentAttendanceResponse =
        StudentAttendanceResponse.fromEntity(attendance);
      return response;
    } catch (error: any) {
      if (error.code === 'P2025')
        throw new ApiException(ErrorCode.STUDENT_NOT_FOUND);
      throw new ApiException(ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * update 메서드는 학생 출결 상태를 변경합니다
   * @param id
   * @param status
   */
  async update(
    id: string,
    status: StudentAttendanceStatus,
  ): Promise<StudentAttendanceResponse> {
    const existing = await this.studentAttendanceRepository.findById(id);
    if (!existing) {
      throw new ApiException(ErrorCode.ATTENDANCE_NOT_FOUND);
    }

    const updated = await this.studentAttendanceRepository.update(id, status);
    const response: StudentAttendanceResponse =
      StudentAttendanceResponse.fromEntity(updated);
    return response;
  }

  /**
   * findList 메서드는 노동조합으로 조회합니다.
   * @param studentId
   * @param classId
   * @param lectureDate
   * @returns
   */
  async findList(
    studentId?: string,
    classId?: string,
    lectureDate?: string,
  ): Promise<StudentAttendanceResponse[]> {
    const list = await this.studentAttendanceRepository.findList(
      studentId,
      classId,
      lectureDate,
    );
    return list.map((attendance) =>
      StudentAttendanceResponse.fromEntity(attendance),
    );
  }
}
