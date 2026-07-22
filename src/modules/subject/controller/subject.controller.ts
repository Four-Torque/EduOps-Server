import { Controller, Get, Query } from '@nestjs/common';
import { SubjectService } from '../service/subject.service';
import { Role } from 'src/global';
import { PaginatedSubjectRequest } from '../request/paginated-subject.request';
import { SubjectResponse } from '../response/subject.response';

@Controller('subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Role('MANAGER', 'DIRECTOR')
  @Get()
  async findAll(
    @Query() request: PaginatedSubjectRequest,
  ): Promise<SubjectResponse[]> {
    const response: SubjectResponse[] =
      await this.subjectService.findAll(request);
    return response;
  }
}
