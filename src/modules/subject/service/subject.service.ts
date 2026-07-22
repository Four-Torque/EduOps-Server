import { Injectable } from '@nestjs/common';
import { SubjectRepository } from '../repository/subject.repository';
import { ApiException, ErrorCode } from 'src/global';
import { SubjectResponse } from '../response/subject.response';
import { PaginatedSubjectRequest } from '../request/paginated-subject.request';

@Injectable()
export class SubjectService {
  constructor(private readonly subjectRepository: SubjectRepository) {}

  async create(name: string) {
    const existingSubject = await this.subjectRepository.findByName(name);
    if (existingSubject) {
      throw new ApiException(ErrorCode.SUBJECT_ALREADY_EXISTS);
    }
    const newSubject = await this.subjectRepository.create(name);
    const response = SubjectResponse.fromEntity(newSubject);
    return response;
  }

  async findAll(request: PaginatedSubjectRequest): Promise<SubjectResponse[]> {
    const { search } = request;

    const subjects = await this.subjectRepository.findAll(search);

    const response: SubjectResponse[] = subjects.map((subject) =>
      SubjectResponse.fromEntity(subject),
    );
    return response;
  }
}
