import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  static toEntity(request: CreateCategoryRequest): Prisma.CategoryCreateInput {
    return {
      name: request.name,
    };
  }
}
