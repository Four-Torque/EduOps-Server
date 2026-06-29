import { v4 as uuid } from 'uuid';
import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import {
  APP_NAME,
  CLIENT_URL,
  EMAIL_URL,
  APP_LOGO,
  SENDER_EMAIL,
  SENDER_PWD,
} from 'src/global';
import { ApiException } from 'src/global/exceptions/api.exception';
import { ErrorCode } from 'src/global/enums/error-code.enum';
import { RedisKey, RedisService } from 'src/redis';
import { CreateUserRequest } from 'src/modules/user/request/create-user.request';

@Injectable()
export class EmailService {
  constructor(private readonly redis: RedisService) {}
  private readonly LOGGER = new Logger(EmailService.name);

  async sendVerificationEmail({
    type,
    payload,
  }: {
    type: string;
    payload: CreateUserRequest | { email: string };
  }) {
    const token = uuid();

    let redisKey: string | undefined;
    if (type === 'register') {
      redisKey = RedisKey.verificationRegister(token);
    } else if (type === 'reset') {
      redisKey = RedisKey.verificationReset(token);
    }

    if (!redisKey) {
      throw new ApiException(ErrorCode.BAD_REQUEST);
    }

    await this.redis.set(redisKey, JSON.stringify(payload), 900);

    const path =
      type === 'register' ? 'register/verify' : 'reset-password/verify';
    const url = `${CLIENT_URL}/${path}?token=${token}`;

    try {
      await axios.post(EMAIL_URL || '', {
        serviceName: APP_NAME,
        logo: APP_LOGO,
        senderEmail: SENDER_EMAIL,
        senderPwd: SENDER_PWD,
        email: payload.email,
        type,
        url,
      });
    } catch (error) {
      await this.redis.del(redisKey);
      this.LOGGER.error('이메일 발송 실패: ', error);
    }
  }
}
