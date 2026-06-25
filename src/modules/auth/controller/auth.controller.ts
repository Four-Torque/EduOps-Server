import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { CreateUserRequest } from 'src/modules/user/request/create-user.request';
import { Message, ResponseMessage } from 'src/global';

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
}
