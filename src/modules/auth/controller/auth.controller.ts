import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { CreateUserRequest } from 'src/modules/user/request/create-user.request';
import {
  clearCookies,
  ErrorCode,
  JwtPayload,
  Message,
  Public,
  ResponseMessage,
  setCookies,
} from 'src/global';
import { AuthRequest } from '../request/auth.request';
import { Request, Response } from 'express';
import { RefreshGuard } from '../guards/refresh.guard';
import { ResetPasswordRequest } from '../request/reset-password.request';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from 'src/global/decorators/swagger.decorator';
import { User } from '@prisma/client';
import { EmailResponse } from '../response/email.response';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({
    summary: '회원가입',
    description: '회원가입을 위한 이메일이 발송됩니다.',
  })
  @ApiSuccessResponse(ResponseMessage.VERIFICATION_EMAIL_SENT)
  @ApiErrorResponse(ErrorCode.USER_ALREADY_EXISTS)
  @Message(ResponseMessage.VERIFICATION_EMAIL_SENT)
  @Post('register')
  async register(@Body() request: CreateUserRequest): Promise<void> {
    await this.authService.register(request);
  }

  @Public()
  @ApiOperation({
    summary: '이메일 인증',
    description: '이메일 인증 후 회원가입이 완료됩니다.',
  })
  @ApiSuccessResponse(ResponseMessage.VERIFICATION_SUCCESS)
  @ApiErrorResponse(
    ErrorCode.VERIFICATION_TOKEN_INVALID,
    ErrorCode.USER_ALREADY_EXISTS,
    ErrorCode.VERIFICATION_FAILED,
  )
  @Message(ResponseMessage.VERIFICATION_SUCCESS)
  @Post('verify')
  async verify(
    @Body('token') token: string,
    @Body('type') type: string,
  ): Promise<void> {
    await this.authService.verify(token, type);
  }

  @Public()
  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인을 진행합니다.',
  })
  @ApiSuccessResponse()
  @ApiErrorResponse(ErrorCode.INVALID_EMAIL_OR_PASSWORD)
  @Post('login')
  async login(
    @Body() request: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.login(request);
    return setCookies(response, accessToken, refreshToken);
  }

  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃을 진행합니다.',
  })
  @ApiSuccessResponse()
  @Post('logout')
  async logout(
    @Req() req: Request & { user: JwtPayload },
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const user = req.user as User;
    await this.authService.logout(user.id);
    clearCookies(res);
  }

  @Public()
  @ApiOperation({
    summary: '토큰 재발급',
    description: '리프레시 토큰을 이용하여 액세스 토큰을 재발급합니다.',
  })
  @ApiSuccessResponse()
  @ApiErrorResponse(ErrorCode.INVALID_REFRESH_TOKEN, ErrorCode.USER_NOT_FOUND)
  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.refresh(request);
    return setCookies(response, accessToken, refreshToken);
  }

  @Public()
  @ApiOperation({
    summary: '비밀번호 재설정 이메일 발송',
    description: '비밀번호 재설정을 위한 이메일을 발송합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.VERIFICATION_EMAIL_SENT)
  @ApiErrorResponse(ErrorCode.USER_NOT_FOUND)
  @Message(ResponseMessage.VERIFICATION_EMAIL_SENT)
  @Post('reset-password/send')
  async sendResetPasswordMail(@Body('email') email: string) {
    await this.authService.sendResetPasswordMail(email);
  }

  @Public()
  @ApiOperation({
    summary: '비밀번호 재설정 토큰 검증',
    description: '비밀번호 재설정을 위한 토큰을 검증합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.VERIFICATION_SUCCESS, EmailResponse)
  @ApiErrorResponse(ErrorCode.VERIFICATION_TOKEN_INVALID)
  @Message(ResponseMessage.VERIFICATION_SUCCESS)
  @Get('reset-password/verify')
  async verifyResetPasswordToken(@Query('token') token: string) {
    const response = await this.authService.verify(token, 'reset');
    return response;
  }

  @Public()
  @ApiOperation({
    summary: '비밀번호 재설정',
    description: '비밀번호를 재설정합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.PASSWORD_RESET_SUCCESS)
  @ApiErrorResponse(
    ErrorCode.VERIFICATION_TOKEN_INVALID,
    ErrorCode.USER_NOT_FOUND,
  )
  @Message(ResponseMessage.PASSWORD_RESET_SUCCESS)
  @Put('reset-password')
  async resetPassword(@Body() request: ResetPasswordRequest) {
    const response = await this.authService.resetPassword(request);
    return response;
  }
}
