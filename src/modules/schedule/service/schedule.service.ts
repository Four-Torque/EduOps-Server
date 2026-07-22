import { Injectable } from '@nestjs/common';
import { ScheduleRepository } from '../repository/schedule.repository';
import { CreateScheduleBulkRequest } from '../request/create-schedule.request';
import { ScheduleResponse } from '../response/schedule.response';
import { ClassRepository } from '../../class/repository/class.repository';
import { ApiException, ErrorCode } from 'src/global';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly classRepository: ClassRepository,
  ) {}

  /**
   * createBulk 메서드는 시간표를 생성 합니다. (배열형태 저장 가능)
   * @param request
   */
  async createBulk(request: CreateScheduleBulkRequest): Promise<void> {
    // 1. 강좌 존재 여부 확인
    const cls = await this.classRepository.findById(request.classId);
    if (!cls) {
      throw new ApiException(ErrorCode.CLASS_NOT_FOUND);
    }
    const studentIds = await this.scheduleRepository.getStudentIdsByClassId(
      request.classId,
    );

    // 2. 유효성 검사 및 중복 검사
    for (const schedule of request.schedules) {
      if (schedule.startTime >= schedule.endTime) {
        throw new ApiException(ErrorCode.BAD_REQUEST);
      }

      // 교사 중복 검사
      const teacherOverlap =
        await this.scheduleRepository.findOverlappingForTeacher(
          cls.teacherId,
          schedule.dayOfWeek,
          schedule.startTime,
          schedule.endTime,
        );
      if (teacherOverlap) {
        throw new ApiException(ErrorCode.TEACHER_SCHEDULE_CONFLICT);
      }

      // 강의실 중복 검사
      const roomOverlap = await this.scheduleRepository.findOverlappingForRoom(
        schedule.room,
        schedule.dayOfWeek,
        schedule.startTime,
        schedule.endTime,
      );
      if (roomOverlap) {
        throw new ApiException(ErrorCode.ROOM_SCHEDULE_CONFLICT);
      }

      // 학생 중복 검사
      if (studentIds.length > 0) {
        const studentOverlap =
          await this.scheduleRepository.findOverlappingForStudents(
            request.classId,
            studentIds,
            schedule.dayOfWeek,
            schedule.startTime,
            schedule.endTime,
          );
        if (studentOverlap) {
          throw new ApiException(ErrorCode.STUDENT_SCHEDULE_CONFLICT);
        }
      }
    }

    // 3. 시간표 일괄 등록
    const entities = CreateScheduleBulkRequest.toEntities(request);
    await this.scheduleRepository.createMany(entities);
  }

  /**
   * findAllByClassId 메서드는 강좌 아이디로 시간표를 조회합니다.
   * @param classId
   * @returns
   */
  async findAllByClassId(classId: string): Promise<ScheduleResponse[]> {
    const cls = await this.classRepository.findById(classId);
    if (!cls) {
      throw new ApiException(ErrorCode.CLASS_NOT_FOUND);
    }

    const schedules = await this.scheduleRepository.findByClassId(classId);
    return schedules.map(ScheduleResponse.fromEntity);
  }

  /**
   * delete 메서드는 아이디로 시간표를 삭제합니다.
   * @param id
   */
  async delete(id: string): Promise<void> {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new ApiException(ErrorCode.SCHEDULE_NOT_FOUND);
    }

    await this.scheduleRepository.delete(id);
  }

  async findAll(
    classId?: string,
    room?: string,
    teacherName?: string,
    subjectId?: string,
  ): Promise<ScheduleResponse[]> {
    const schedules = await this.scheduleRepository.findAll(
      classId,
      room,
      teacherName,
      subjectId,
    );
    console.log('schedules', schedules);
    return schedules.map(ScheduleResponse.fromEntity);
  }
}
