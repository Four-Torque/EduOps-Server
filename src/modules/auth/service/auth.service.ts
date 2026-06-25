import { Injectable } from '@nestjs/common';
import { ApiException, ErrorCode } from 'src/global';
import { EmailService } from 'src/modules/email/service/email.service';
import { CreateUserRequest } from 'src/modules/user/request/create-user.request';
import { UserService } from 'src/modules/user/service/user.service';
import { RedisKey, RedisService } from 'src/redis';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly redis: RedisService,
    private readonly emailService: EmailService,
  ) {}

  async register(request: CreateUserRequest): Promise<void> {
    const user = await this.userService.findByEmail(request.email);
    if (user) {
      throw new ApiException(ErrorCode.USER_ALREADY_EXISTS);
    }
    this.emailService.sendVerificationEmail({
      type: 'register',
      payload: request,
    });
  }

  async verify(token: string, type: string): Promise<void> {
    if (!token) {
      throw new ApiException(ErrorCode.VERIFICATION_TOKEN_INVALID);
    }

    if (type === 'register') {
      await this.verifyRegister(token);
    } else if (type === 'reset') {
    }
    throw new ApiException(ErrorCode.VERIFICATION_FAILED);
  }

  private async verifyRegister(token: string): Promise<void> {
    const redisKey = RedisKey.verificationRegister(token);
    const cachedUserData = await this.redis.get(redisKey);
    if (!cachedUserData) {
      throw new ApiException(ErrorCode.VERIFICATION_TOKEN_INVALID);
    }

    const userData = JSON.parse(cachedUserData) as CreateUserRequest;

    const user = await this.userService.findByEmail(userData.email);
    if (user) {
      await this.redis.del(redisKey);
      throw new ApiException(ErrorCode.USER_ALREADY_EXISTS);
    }

    await this.userService.create(userData);

    await this.redis.del(redisKey);
  }
}
