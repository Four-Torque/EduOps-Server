import { Injectable } from '@nestjs/common';
import { ClassSyllabusRepository } from '../repository/class-syllabus.repository';
import { CreateClassSyllabusRequest } from '../request/create-class-syllabus.request';
import { ClassSyllabusResponse } from '../response/class-syllabus.response';
import { PaginatedClassSyllabusResponse } from '../response/paginated-class-syllabus.response';
import { RejectClassSyllabusRequest } from '../request/reject-class-syllabus.request';
import { ApiException, ErrorCode } from 'src/global';
import { SyllabusStatus } from '@prisma/client';

@Injectable()
export class ClassSyllabusService {
  constructor(private readonly classSyllabusRepository: ClassSyllabusRepository) {}

  async create(teacherId: string, request: CreateClassSyllabusRequest): Promise<ClassSyllabusResponse> {
    const entity = await this.classSyllabusRepository.create(
      CreateClassSyllabusRequest.toEntity(teacherId, request),
    );
    return ClassSyllabusResponse.fromEntity(entity);
  }

  async findById(id: string): Promise<ClassSyllabusResponse> {
    const existing = await this.classSyllabusRepository.findById(id);
    if (!existing) {
      throw new ApiException(ErrorCode.CLASS_SYLLABUS_NOT_FOUND);
    }
    return ClassSyllabusResponse.fromEntity(existing);
  }

  async findAll(
    userRole: string,
    userId: string,
    status?: SyllabusStatus,
    page?: number,
    limit?: number,
  ): Promise<PaginatedClassSyllabusResponse> {
    const skip = ((page || 1) - 1) * (limit || 20);
    const take = limit || 20;

    let targetTeacherId: string | undefined;
    if (userRole === 'TEACHER') {
      targetTeacherId = userId;
    }

    const [data, total] = await Promise.all([
      this.classSyllabusRepository.findAll(targetTeacherId, status, skip, take),
      this.classSyllabusRepository.count(targetTeacherId, status),
    ]);

    const mappedData = data.map((item) => ClassSyllabusResponse.fromEntity(item));
    return {
      page: page || 1,
      total,
      data: mappedData,
    };
  }

  async approve(id: string): Promise<ClassSyllabusResponse> {
    const existing = await this.classSyllabusRepository.findById(id);
    if (!existing) {
      throw new ApiException(ErrorCode.CLASS_SYLLABUS_NOT_FOUND);
    }
    if (existing.status !== SyllabusStatus.PENDING) {
      throw new ApiException(ErrorCode.CLASS_SYLLABUS_NOT_PENDING);
    }

    const { syllabus } = await this.classSyllabusRepository.approveAndCreateClass(id, existing);
    return ClassSyllabusResponse.fromEntity(syllabus);
  }

  async reject(id: string, request: RejectClassSyllabusRequest): Promise<ClassSyllabusResponse> {
    const existing = await this.classSyllabusRepository.findById(id);
    if (!existing) {
      throw new ApiException(ErrorCode.CLASS_SYLLABUS_NOT_FOUND);
    }
    if (existing.status !== SyllabusStatus.PENDING) {
      throw new ApiException(ErrorCode.CLASS_SYLLABUS_NOT_PENDING);
    }

    const rejected = await this.classSyllabusRepository.update(id, {
      status: SyllabusStatus.REJECTED,
      rejectedReason: request.rejectedReason,
    });
    return ClassSyllabusResponse.fromEntity(rejected);
  }
}
