import { Injectable } from '@nestjs/common';
import { StudentRepository } from '../repository/student.repository';
import { StudentResponse } from '../response/student.response';
import { PaginatedStudentResponse } from '../response/student-list.response';
import { StudentStatus } from '@prisma/client';
import { ApiException, ErrorCode } from 'src/global';
import { CreateStudentRequest } from '../request/create-student.request';
import { UpdateStudentRequest } from '../request/update-student.request';
import { RedisKey, RedisService } from 'src/redis';

@Injectable()
export class StudentService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly redis: RedisService,
  ) {}

  /**
   * getList 메서드는 학생 목록을 조회합니다
   * @param status
   * @param name
   * @Param phone
   * @param page
   * @param limit
   * @returns
   */
  async getList(
    status: StudentStatus,
    name: string,
    phone: string,
    page: number,
    limit: number,
  ): Promise<PaginatedStudentResponse> {
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      this.studentRepository.findList(status, name, phone, skip, limit),
      this.studentRepository.countList(status, name, phone),
    ]);

    return {
      total,
      page,
      data: students.map((student) => StudentResponse.fromEntity(student)),
    };
  }

  /**
   * findById 메서드는 학생의 상세 정보를 조회합니다.
   * @param id
   */
  async findById(id: string): Promise<StudentResponse> {
    const key = RedisKey.studentDetail(id);
    return this.redis.getOrSet(
      key,
      async () => {
        const student = await this.studentRepository.findById(id);
        if (!student) {
          throw new ApiException(ErrorCode.STUDENT_NOT_FOUND);
        }
        return StudentResponse.fromEntity(student);
      },
      600,
    );
  }

  /**
   * create 메서드는 새로운 학생을 생성합니다.
   * @param request
   * @returns
   */
  async create(request: CreateStudentRequest): Promise<StudentResponse> {
    const response = await this.studentRepository.create(
      CreateStudentRequest.toEntity(request),
    );
    await this.redis.del(RedisKey.studentStats());
    return StudentResponse.fromEntity(response);
  }

  async update(
    id: string,
    request: UpdateStudentRequest,
  ): Promise<StudentResponse> {
    const existing = await this.studentRepository.findById(id);
    if (!existing) {
      throw new ApiException(ErrorCode.STUDENT_NOT_FOUND);
    }

    const data = UpdateStudentRequest.toEntity(request);
    const updated = await this.studentRepository.update(id, data);

    await this.redis.del(RedisKey.studentDetail(id));
    await this.redis.del(RedisKey.studentStats());

    const response: StudentResponse = StudentResponse.fromEntity(updated);
    return response;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.studentRepository.findById(id);
    if (!existing) {
      throw new ApiException(ErrorCode.STUDENT_NOT_FOUND);
    }
    await this.studentRepository.delete(id);
    await this.redis.del(RedisKey.studentDetail(id));
    await this.redis.del(RedisKey.studentStats());
  }

  async getStats() {
    const key = RedisKey.studentStats();
    return this.redis.getOrSet(
      key,
      () => this.studentRepository.getStats(),
      600,
    );
  }
}
