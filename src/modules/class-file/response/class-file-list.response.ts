import { ApiProperty } from '@nestjs/swagger';
import { ClassFileResponse } from './class-file.response';

export class PaginatedClassFileResponse {
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
    description: '수업 파일 정보',
    type: [ClassFileResponse],
  })
  data: ClassFileResponse[];
}
