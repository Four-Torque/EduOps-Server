import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserResponse } from '../response/user.response';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  CurrentUser,
  ErrorCode,
  JwtPayload,
  Message,
  ResponseMessage,
} from 'src/global';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/modules/auth/guards/jwt.guard';
import { Role, UserStatus } from '@prisma/client';
import { PaginatedUserResponse } from '../response/user-list.response';
import { CreateUserRequest } from '../request/create-user.request';
import { UpdateUserRequest } from '../request/update-user.request';

@ApiTags('유저')
// @TODO Guard활성화
// @UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: '사용자 세션 조회',
    description: '현재 로그인한 사용자의 세션 정보를 조회합니다.',
  })
  @ApiSuccessResponse(null, UserResponse)
  @ApiErrorResponse(ErrorCode.USER_NOT_FOUND)
  @Get('me')
  async getSession(@CurrentUser() user: JwtPayload): Promise<UserResponse> {
    const response: UserResponse = await this.userService.getSession(user.id);
    return response;
  }

  @ApiOperation({
    summary: '사용자 목록 조회',
    description: '전체 사용자 목록 조회. role, status로 필터 가능',
  })
  @ApiSuccessResponse(ResponseMessage.USER_LIST_FETCHED, PaginatedUserResponse)
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.USER_LIST_FETCHED)
  @Get('/')
  async getUserList(
    @Query('role') role?: Role,
    @Query('status') status?: UserStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedUserResponse> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const response: PaginatedUserResponse = await this.userService.getList(
      role,
      status,
      pageNum,
      limitNum,
    );
    return response;
  }

  @ApiOperation({
    summary: '사용자 상세 조회',
    description: '특정 사용자의 정보를 조회합니다',
  })
  @ApiSuccessResponse(ResponseMessage.USER_FETCHED, UserResponse)
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.USER_FETCHED)
  @Get('/:id')
  async getUser(@Param('id') id: string): Promise<UserResponse> {
    const response: UserResponse = await this.userService.findById(id);
    return response;
  }

  //@TODO 권한별로 호출가능하도록 수정
  @ApiOperation({
    summary: '사용자 생성',
    description:
      'DIRECTOR 이상 권한을 가진 사용자로부터 신규 사용자를 생성합니다',
  })
  @ApiSuccessResponse(ResponseMessage.USER_CREATED, UserResponse)
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.USER_CREATED)
  @Post('/')
  async createUser(@Body() request: CreateUserRequest): Promise<UserResponse> {
    const response: UserResponse = await this.userService.create(request);
    return response;
  }

  @ApiOperation({
    summary: '사용자 정보 변경',
    description: '사용자의 정보를 변경합니다',
  })
  @ApiSuccessResponse(ResponseMessage.USER_UPDATED, UserResponse)
  @ApiErrorResponse(ErrorCode.USER_NOT_FOUND)
  @Message(ResponseMessage.USER_UPDATED)
  @Patch('/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() request: UpdateUserRequest,
  ): Promise<UserResponse> {
    const response: UserResponse = await this.userService.update(id, request);
    return response;
  }

  @ApiOperation({
    summary: '사용자 삭제',
    description: '사용자를 삭제합니다',
  })
  @ApiSuccessResponse(ResponseMessage.USER_DELETED)
  @ApiErrorResponse(ErrorCode.USER_NOT_FOUND)
  @Message(ResponseMessage.USER_DELETED)
  @Delete('/:id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
