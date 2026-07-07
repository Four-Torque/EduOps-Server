import { ApiProperty } from '@nestjs/swagger';
import { VendorResponse } from './vendor.response';

export class PaginatedVendorResponse {
  @ApiProperty({ description: '페이지 번호', example: 1 })
  page: number;
  @ApiProperty({ description: '전체 데이터 수', example: 100 })
  total: number;
  @ApiProperty({ description: '데이터 목록', type: [VendorResponse] })
  data: VendorResponse[];

  static fromEntity(
    page: number,
    total: number,
    data: VendorResponse[],
  ): PaginatedVendorResponse {
    const response = new PaginatedVendorResponse();
    response.page = page;
    response.total = total;
    response.data = data;
    return response;
  }
}
