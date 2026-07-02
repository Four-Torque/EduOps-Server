import { Injectable } from '@nestjs/common';
import { ClassRepository } from '../repository/class.repository';
import { CreateClassRequest } from '../request/create-class.request';
import { ClassResponse } from '../response/class.response';
import { ApiException, ErrorCode } from 'src/global';
import { UpdateClassRequest } from '../request/update-class.request';

@Injectable()
export class ClassService {
  constructor(private readonly classRepository: ClassRepository) {}

  /**
   * create 메서드는 강좌를 생성합니다
   * @param request
   * @returns
   */
  async create(request: CreateClassRequest): Promise<ClassResponse> {
    const response = await this.classRepository.create(
      CreateClassRequest.toEntity(request),
    );
    return ClassResponse.fromEntity(response);
  }

  async update(
    id: string,
    request: UpdateClassRequest,
  ): Promise<ClassResponse> {
    const existing = await this.classRepository.findById(id);
    if (!existing) {
      throw new ApiException(ErrorCode.CLASS_NOT_FOUND);
    }

    const data = UpdateClassRequest.toEntity(request);
    const updated = await this.classRepository.update(id, data);

    const response: ClassResponse = ClassResponse.fromEntity(updated);
    return response;
  }

  async findById(id: string): Promise<ClassResponse> {
    const existing = await this.classRepository.findById(id);
    if (!existing) {
      throw new ApiException(ErrorCode.CLASS_NOT_FOUND);
    }
    return ClassResponse.fromEntity(existing);
  }

  async findAll(
    name?: string,
    teacherId?: string,
    status?: any,
    page?: number,
    limit?: number,
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.classRepository.findAll(name, teacherId, status, skip, limit),
      this.classRepository.count(name, teacherId, status),
    ]);

    const mappedData = data.map((cls) => ClassResponse.fromEntity(cls));
    return {
      page: page || 1,
      total,
      data: mappedData,
    };
  }
}
