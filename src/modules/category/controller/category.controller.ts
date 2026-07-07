import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from '../service/category.service';
import { CategoryResponse } from '../response/category.response';
import { CreateCategoryRequest } from '../request/create-category.request';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  Message,
  ResponseMessage,
  CurrentUser,
  JwtPayload,
} from 'src/global';
import { UpdateCategoryRequest } from '../request/update-category.request';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/modules/auth/guards/jwt.guard';

@ApiTags('자재 카테고리')
@Controller('category')
@UseGuards(JwtGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({
    summary: '카테고리 생성',
    description: '카테고리를 생성합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.CATEGORY_CREATED, CategoryResponse)
  @Message(ResponseMessage.CATEGORY_CREATED)
  @Post()
  async create(
    @Body() request: CreateCategoryRequest,
    @CurrentUser() user: JwtPayload,
  ): Promise<CategoryResponse> {
    const response: CategoryResponse =
      await this.categoryService.create(request, user.branchId);
    return response;
  }

  @ApiOperation({
    summary: '카테고리 조회',
    description: '모든 카테고리를 조회합니다.',
  })
  @ApiSuccessResponse(null, CategoryResponse, true)
  @Get()
  async findAll(@CurrentUser() user: JwtPayload): Promise<CategoryResponse[]> {
    const response: CategoryResponse[] = await this.categoryService.findAll(user.branchId);
    return response;
  }

  @ApiOperation({
    summary: '카테고리 상세 조회',
    description: '카테고리 ID로 카테고리를 조회합니다.',
  })
  @ApiSuccessResponse(null, CategoryResponse)
  @ApiErrorResponse(ErrorCode.CATEGORY_NOT_FOUND)
  @Get(':id')
  async findById(@Param('id') id: string): Promise<CategoryResponse> {
    const response: CategoryResponse = await this.categoryService.findById(id);
    return response;
  }

  @ApiOperation({
    summary: '카테고리 수정',
    description: '카테고리를 수정합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.CATEGORY_UPDATED, CategoryResponse)
  @ApiErrorResponse(ErrorCode.CATEGORY_NOT_FOUND)
  @Message(ResponseMessage.CATEGORY_UPDATED)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() request: UpdateCategoryRequest,
  ): Promise<CategoryResponse> {
    const response: CategoryResponse = await this.categoryService.update(
      id,
      request,
    );
    return response;
  }

  @ApiOperation({
    summary: '카테고리 삭제',
    description: '카테고리를 삭제합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.CATEGORY_DELETED)
  @ApiErrorResponse(ErrorCode.CATEGORY_NOT_FOUND)
  @Message(ResponseMessage.CATEGORY_DELETED)
  @Delete()
  async delete(@Body() ids: string[]): Promise<void> {
    await this.categoryService.delete(ids);
  }
}
