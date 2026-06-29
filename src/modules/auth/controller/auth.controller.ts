import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { CreateUserRequest } from 'src/modules/user/request/create-user.request';
import { Message, Public, ResponseMessage, setCookies } from 'src/global';
import { AuthRequest } from '../request/auth.request';
import { Request, Response } from 'express';
import { RefreshGuard } from '../guards/refresh.guard';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Message(ResponseMessage.VERIFICATION_EMAIL_SENT)
  @Post('register')
  async register(@Body() request: CreateUserRequest): Promise<void> {
    await this.authService.register(request);
  }

  @Message(ResponseMessage.VERIFICATION_SUCCESS)
  @Post('verify')
  async verify(
    @Body('token') token: string,
    @Body('type') type: string,
  ): Promise<void> {
    await this.authService.verify(token, type);
  }

  @Post('login')
  async login(
    @Body() request: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.login(request);
    return setCookies(response, accessToken, refreshToken);
  }

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
}
