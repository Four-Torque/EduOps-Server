import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repository/category.repository';
import { CategoryResponse } from '../response/category.response';
import { ApiException, ErrorCode } from 'src/global';
import { CreateCategoryRequest } from '../request/create-category.request';
import { UpdateCategoryRequest } from '../request/update-category.request';
import { RedisKey, RedisService } from 'src/redis';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly redis: RedisService,
  ) {}

  async findAll(): Promise<CategoryResponse[]> {
    const key = RedisKey.categoryList();
    return this.redis.getOrSet(
      key,
      async () => {
        const categories = await this.categoryRepository.findAll();
        return categories.map((category) =>
          CategoryResponse.fromEntity(category),
        );
      },
      1800,
    );
  }

  async findById(id: string): Promise<CategoryResponse> {
    const key = RedisKey.categoryDetail(id);
    return this.redis.getOrSet(
      key,
      async () => {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
          throw new ApiException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        return CategoryResponse.fromEntity(category);
      },
      1800,
    );
  }

  async create(request: CreateCategoryRequest): Promise<CategoryResponse> {
    const category = await this.categoryRepository.create(
      CreateCategoryRequest.toEntity(request),
    );
    await this.redis.del(RedisKey.categoryList());
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
    await this.redis.del(RedisKey.categoryList());
    await this.redis.del(RedisKey.categoryDetail(id));
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
    await this.redis.del(RedisKey.categoryList());
    for (const id of ids) {
      await this.redis.del(RedisKey.categoryDetail(id));
    }
  }
}
