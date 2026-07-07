import { ApiProperty } from '@nestjs/swagger';
import { Category } from '@prisma/client';

export class CategoryResponse {
  @ApiProperty({ description: '카테고리 ID', example: 'category-uuid' })
  id: string;
  @ApiProperty({ description: '카테고리 이름', example: '전자기기' })
  name: string;
  @ApiProperty({ description: '생성일', example: '2023-01-01T00:00:00Z' })
  createdAt: Date;
  @ApiProperty({ description: '수정일', example: '2023-01-01T00:00:00Z' })
  updatedAt: Date;

  static fromEntity(entity: Category): CategoryResponse {
    const response = new CategoryResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
