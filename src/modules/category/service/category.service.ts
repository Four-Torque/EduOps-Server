import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repository/category.repository';
import { CategoryResponse } from '../response/category.response';
import { ApiException, ErrorCode } from 'src/global';
import { CreateCategoryRequest } from '../request/create-category.request';
import { UpdateCategoryRequest } from '../request/update-category.request';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll(): Promise<CategoryResponse[]> {
    const categories = await this.categoryRepository.findAll();
    const response: CategoryResponse[] = categories.map((category) =>
      CategoryResponse.fromEntity(category),
    );
    return response;
  }

  async findById(id: string): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new ApiException(ErrorCode.CATEGORY_NOT_FOUND);
    }
    const response = CategoryResponse.fromEntity(category);
    return response;
  }

  async create(request: CreateCategoryRequest): Promise<CategoryResponse> {
    const category = await this.categoryRepository.create(
      CreateCategoryRequest.toEntity(request),
    );
    const response = CategoryResponse.fromEntity(category);
    return response;
  }

  async update(
    id: string,
    request: UpdateCategoryRequest,
  ): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new ApiException(ErrorCode.CATEGORY_NOT_FOUND);
    }
    const updatedCategory = await this.categoryRepository.update(
      id,
      UpdateCategoryRequest.toEntity(request),
    );
    const response = CategoryResponse.fromEntity(updatedCategory);
    return response;
  }

  async delete(ids: string[]): Promise<void> {
    const categories = await Promise.all(
      ids.map((id) => this.categoryRepository.findById(id)),
    );

    if (ids.length !== categories.length) {
      throw new ApiException(ErrorCode.CATEGORY_NOT_FOUND);
    }
    await this.categoryRepository.delete(ids);
  }
}
