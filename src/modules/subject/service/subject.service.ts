import { Injectable } from '@nestjs/common';
import { SubjectRepository } from '../repository/subject.repository';
import { ApiException, ErrorCode } from 'src/global';
import { SubjectResponse } from '../response/subject.response';
import { PaginatedSubjectRequest } from '../request/paginated-subject.request';
import { RedisKey, RedisService } from 'src/redis';

@Injectable()
export class SubjectService {
  constructor(
    private readonly subjectRepository: SubjectRepository,
    private readonly redis: RedisService,
  ) {}

  async create(name: string) {
    const existingSubject = await this.subjectRepository.findByName(name);
    if (existingSubject) {
      throw new ApiException(ErrorCode.SUBJECT_ALREADY_EXISTS);
    }
    const newSubject = await this.subjectRepository.create(name);
    await this.redis.del(RedisKey.subjectList('*'));
    const response = SubjectResponse.fromEntity(newSubject);
    return response;
  }

  async findAll(request: PaginatedSubjectRequest): Promise<SubjectResponse[]> {
    const { search } = request;
    const key = RedisKey.subjectList(search);

    return this.redis.getOrSet(
      key,
      async () => {
        const subjects = await this.subjectRepository.findAll(search);
        return subjects.map((subject) => SubjectResponse.fromEntity(subject));
      },
      1800,
    );
  }
}
