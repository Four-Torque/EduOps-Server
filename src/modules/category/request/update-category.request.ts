import { PartialType } from '@nestjs/swagger';
import { CreateCategoryRequest } from './create-category.request';
import { Prisma } from '@prisma/client';

export class UpdateCategoryRequest extends PartialType(CreateCategoryRequest) {
  static toEntity(request: UpdateCategoryRequest): Prisma.CategoryUpdateInput {
    return {
      name: request.name,
    };
  }
}
