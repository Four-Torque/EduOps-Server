import { Controller, Get } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserResponse } from '../response/user.response';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  CurrentUser,
  ErrorCode,
  JwtPayload,
} from 'src/global';
import { ApiOperation } from '@nestjs/swagger';

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
}
