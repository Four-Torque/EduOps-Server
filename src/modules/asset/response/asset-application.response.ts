import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus, AssetsApplication } from '@prisma/client';

export class AssetApplicationResponse {
  @ApiProperty({
    description: '자재 요청 ID',
    example: 'asset-application-uuid',
  })
  id: string;
  @ApiProperty({ description: '요청자 이름', example: '홍길동' })
  userName: string;
  @ApiProperty({ description: '요청자 ID', example: 'user-uuid' })
  userId: string;
  @ApiProperty({ description: '카테고리 이름', example: '전자제품' })
  categoryName: string;
  @ApiProperty({ description: '카테고리 ID', example: 'category-uuid' })
  categoryId: string;
  @ApiProperty({ description: '구매처 이름', example: '삼성' })
  vendorName: string;
  @ApiProperty({ description: '구매처 ID', example: 'vendor-uuid' })
  vendorId: string;
  @ApiProperty({ description: '자재 ID', example: 'asset-uuid' })
  assetId: string;
  @ApiProperty({ description: '자재 이름', example: '노트북' })
  assetName: string;
  @ApiProperty({ description: '요청 수량', example: 5 })
  quantity: number;
  @ApiProperty({ description: '요청 가격', example: 1000000 })
  price: number;
  @ApiProperty({ description: '요청 사유', example: '업무용으로 필요합니다.' })
  reason: string;
  @ApiProperty({ description: '재고 수량', example: 10 })
  stock: number;
  @ApiProperty({ description: '거절 사유', example: '재고 부족' })
  rejectedReason?: string;
  @ApiProperty({ description: '요청 상태', example: 'PENDING' })
  status: ApplicationStatus;
  @ApiProperty({ description: '요청일', example: '2023-01-01T00:00:00Z' })
  requestedAt: Date;
  @ApiProperty({ description: '처리일', example: '2023-01-02T00:00:00Z' })
  processedAt?: Date;

  static fromEntity(
    entity: AssetsApplication & {
      user: { name: string };
      category: { name: string };
      vendor: { name: string };
    },
    stock: number = 0,
  ): AssetApplicationResponse {
    const response = new AssetApplicationResponse();
    response.id = entity.id;
    response.userName = entity.user.name;
    response.userId = entity.userId;
    response.categoryName = entity.category.name;
    response.categoryId = entity.categoryId;
    response.vendorName = entity.vendor.name;
    response.vendorId = entity.vendorId;
    response.assetName = entity.name;
    response.quantity = entity.quantity;
    response.price = entity.price;
    response.reason = entity.reason;
    response.rejectedReason = entity.rejectedReason;
    response.status = entity.status;
    response.stock = stock;
    response.requestedAt = entity.requestedAt;
    response.processedAt = entity.processedAt;
    return response;
  }
}
