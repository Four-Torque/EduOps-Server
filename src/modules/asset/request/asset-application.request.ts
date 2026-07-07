import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AssetApplicationRequest {
  @ApiProperty({ description: '카테고리 ID', example: 'category-uuid' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: '자재 이름', example: '노트북' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '구매처 ID', example: 'vendor-uuid' })
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty({ description: '수량', example: 5 })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: '단가', example: 1000000 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiPropertyOptional({ description: '요청 사유', example: '업무용으로 필요합니다.' })
  @IsString()
  @IsOptional()
  reason: string;

  static toEntity(
    request: AssetApplicationRequest,
    userId: string,
    branchId: string,
  ): Prisma.AssetsApplicationCreateInput {
    return {
      name: request.name,
      quantity: request.quantity,
      price: request.price,
      reason: request.reason,
      user: {
        connect: {
          id: userId,
        },
      },
      category: {
        connect: {
          id: request.categoryId,
        },
      },

      vendor: {
        connect: {
          id: request.vendorId,
        },
      },
      branch: {
        connect: {
          id: branchId,
        },
      },
    };
  }
}
