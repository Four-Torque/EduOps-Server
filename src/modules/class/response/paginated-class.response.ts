import { ApiProperty } from '@nestjs/swagger';
import { ClassResponse } from './class.response';

export class PaginatedClassResponse {
  @ApiProperty({
    description: '현재 페이지',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '전체 데이터 수',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: '강좌 데이터 리스트',
    type: [ClassResponse],
  })
  data: ClassResponse[];

  static fromEntity(
    page: number,
    total: number,
    data: ClassResponse[],
  ): PaginatedClassResponse {
    const response = new PaginatedClassResponse();
    response.page = page;
    response.total = total;
    response.data = data;
    return response;
  }
}
