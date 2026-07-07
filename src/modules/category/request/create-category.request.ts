import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryRequest {
  @ApiProperty({ description: '카테고리 이름', example: '전자기기' })
  @IsString()
  @IsNotEmpty()
  name: string;

  static toEntity(request: CreateCategoryRequest, branchId: string): Prisma.CategoryCreateInput {
    return {
      name: request.name,
      branch: { connect: { id: branchId } },
    };
  }
}
