import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiException,
  ErrorCode,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET_KEY,
  JWT_SECRET_EXPIRES_IN,
  JWT_SECRET_KEY,
  JwtPayload,
} from 'src/global';
import { EmailService } from 'src/modules/email/service/email.service';
import { CreateUserRequest } from 'src/modules/user/request/create-user.request';
import { UserService } from 'src/modules/user/service/user.service';
import { RedisKey, RedisService } from 'src/redis';
import { AuthRequest } from '../request/auth.request';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly redis: RedisService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
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

  async login(request: AuthRequest) {
    const user: Omit<User, 'password'> = await this.validateUser(request);
    const redisKey = RedisKey.userRefreshToken(user.id);

    const payload = {
      id: user.id,
      role: user.role,
    };

    const tokens = await this.generateTokens(payload);

    const existingToken = await this.redis.get(redisKey);
    if (existingToken) {
      await this.redis.del(redisKey);
    }
    await this.redis.set(redisKey, tokens.refreshToken, 7 * 24 * 60 * 60);

    return tokens;
  }

  private async generateTokens(payload: JwtPayload) {
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: JWT_SECRET_EXPIRES_IN,
        secret: JWT_SECRET_KEY,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        secret: JWT_REFRESH_SECRET_KEY,
      }),
    };
  }

  private async validateUser(request: AuthRequest) {
    const { email, password } = request;
    const user = await this.userService.findByEmail(email);
    if (user && user.password && bcrypt.compareSync(password, user.password)) {
      return user;
    } else {
      throw new ApiException(ErrorCode.INVALID_EMAIL_OR_PASSWORD);
    }
  }
}
