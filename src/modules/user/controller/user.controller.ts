import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
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
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { PaginatedUserResponse } from '../response/user-list.response';
import { CreateUserRequest } from '../request/create-user.request';
import { UpdateUserRequest } from '../request/update-user.request';
import { UserFilterRequest } from '../request/user-filter.request';
import { UserGroupedResponse } from '../response/user-grouped.response';

@ApiTags('유저')
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
  @Get()
  async getUserList(
    @Query() request: UserFilterRequest,
  ): Promise<PaginatedUserResponse> {
    const response: PaginatedUserResponse =
      await this.userService.getList(request);
    return response;
  }

  @ApiOperation({
    summary: '사용자 목록 그룹 조회',
    description: '본인을 제외한 현재 활동 중인 사용자를 역할(Role)별로 그룹화하여 조회하며 이름으로 검색할 수 있습니다.',
  })
  @ApiSuccessResponse(ResponseMessage.USER_LIST_FETCHED, UserGroupedResponse)
  @ApiQuery({
    name: 'name',
    required: false,
    description: '유저 이름',
  })
  @Message(ResponseMessage.USER_LIST_FETCHED)
  @Get('grouped-by-role')
  async getGroupedUsers(
    @CurrentUser() user: JwtPayload,
    @Query('name') name?: string,
  ): Promise<UserGroupedResponse> {
    return this.userService.getGroupedList(user.id, name);
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

  @ApiOperation({
    summary: '사용자 승인',
    description: '특정 사용자의 계정을 승인합니다',
  })
  @ApiSuccessResponse(ResponseMessage.USER_APPROVED, UserResponse)
  @ApiErrorResponse(ErrorCode.USER_NOT_FOUND)
  @Message(ResponseMessage.USER_APPROVED)
  @Put('/:id/approve')
  async approveUser(@Param('id') id: string): Promise<UserResponse> {
    const response: UserResponse =
      await this.userService.updateApprovedStatus(id);
    return response;
  }
}
