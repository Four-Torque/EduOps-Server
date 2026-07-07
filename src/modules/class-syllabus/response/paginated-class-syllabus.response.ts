import { ApiProperty } from '@nestjs/swagger';
import { ClassSyllabusResponse } from './class-syllabus.response';

export class PaginatedClassSyllabusResponse {
  @ApiProperty()
  page: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [ClassSyllabusResponse] })
  data: ClassSyllabusResponse[];
}
