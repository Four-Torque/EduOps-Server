import { SubjectResponse } from './subject.response';

export class PaginatedSubjectResponse {
  page: number;
  total: number;
  data: SubjectResponse[];

  static fromEntity(
    page: number,
    total: number,
    data: SubjectResponse[],
  ): PaginatedSubjectResponse {
    const response = new PaginatedSubjectResponse();
    response.page = page;
    response.total = total;
    response.data = data;
    return response;
  }
}
