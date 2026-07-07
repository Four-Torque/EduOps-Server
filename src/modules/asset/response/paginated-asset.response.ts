import { Asset } from '@prisma/client';
import { AssetResponse } from './asset.response';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedAssetResponse {
  @ApiProperty({ description: '현재 페이지 번호', example: 1 })
  page: number;
  @ApiProperty({ description: '총 자재 수', example: 100 })
  total: number;
  @ApiProperty({ description: '자재 목록', type: [AssetResponse] })
  data: AssetResponse[];
  @ApiProperty({ description: '총 페이지 수', example: 10 })
  totalPages: number;

  static fromEntity(
    page: number,
    total: number,
    totalPages: number,
    assets: (Asset & {
      category: { name: string };
      vendor: { name: string };
    })[],
  ): PaginatedAssetResponse {
    const response = new PaginatedAssetResponse();
    response.page = page;
    response.total = total;
    response.data = assets.map((asset) => AssetResponse.fromEntity(asset));
    response.totalPages = totalPages;
    return response;
  }
}
