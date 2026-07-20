import { ApiProperty } from '@nestjs/swagger';
import { StudentResponse } from './student.response';

export class PaginatedStudentResponse {
  @ApiProperty({
    description: '총 개수',
    example: 23,
  })
  total: number;

  @ApiProperty({
    description: '페이지',
    example: 2,
  })
  page: number;

  @ApiProperty({
    description: '학생 정보',
    type: [StudentResponse],
  })
  data: StudentResponse[];
}
