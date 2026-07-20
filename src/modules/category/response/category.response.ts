import { Category } from '@prisma/client';

export class CategoryResponse {
  id: string;
  name: string;
  createdAt: Date;
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
