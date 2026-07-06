import { ApiProperty } from '@nestjs/swagger';
import { AssetApplicationResponse } from './asset-application.response';

export class PaginatedAssetApplicationResponse {
  @ApiProperty({ description: '현재 페이지 번호', example: 1 })
  page: number;
  @ApiProperty({ description: '총 자재 요청 수', example: 100 })
  total: number;
  @ApiProperty({
    description: '자재 요청 목록',
    type: [AssetApplicationResponse],
  })
  data: AssetApplicationResponse[];
  @ApiProperty({ description: '총 페이지 수', example: 10 })
  totalPages: number;

  static fromEntity(
    page: number,
    total: number,
    totalPages: number,
    data: AssetApplicationResponse[],
  ): PaginatedAssetApplicationResponse {
    const response = new PaginatedAssetApplicationResponse();
    response.page = page;
    response.total = total;
    response.data = data;
    response.totalPages = totalPages;
    return response;
  }
}
