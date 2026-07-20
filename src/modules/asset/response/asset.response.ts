import { ApiProperty } from '@nestjs/swagger';
import { Asset } from '@prisma/client';

export class AssetResponse {
  @ApiProperty({ description: '자재 ID', example: 'asset-uuid' })
  id: string;
  @ApiProperty({ description: '카테고리 이름', example: '전자제품' })
  categoryName: string;
  @ApiProperty({ description: '카테고리 ID', example: 'category-uuid' })
  categoryId: string;
  @ApiProperty({ description: '자재 이름', example: '노트북' })
  name: string;
  @ApiProperty({ description: '재고 수량', example: 10 })
  stock: number;
  @ApiProperty({ description: '구매처 이름', example: '삼성' })
  vendorName: string;
  @ApiProperty({ description: '구매처 ID', example: 'vendor-uuid' })
  vendorId: string;
  @ApiProperty({ description: '생성일', example: '2023-01-01T00:00:00Z' })
  createdAt: Date;
  @ApiProperty({ description: '수정일', example: '2023-01-02T00:00:00Z' })
  updatedAt: Date;

  static fromEntity(
    entity: Asset & { category: { name: string }; vendor: { name: string } },
  ): AssetResponse {
    const response = new AssetResponse();
    response.id = entity.id;
    response.categoryName = entity.category.name;
    response.categoryId = entity.categoryId;
    response.name = entity.name;
    response.stock = entity.stock;
    response.vendorName = entity.vendor.name;
    response.vendorId = entity.vendorId;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
