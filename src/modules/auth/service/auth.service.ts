import { Injectable, Logger } from '@nestjs/common';
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
import { Request } from 'express';
import { TokenResponse } from '../response/token.response';
import { ResetPasswordRequest } from '../request/reset-password.request';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly redis: RedisService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly LOGGER = new Logger(AuthService.name);

  /**
   * register 함수는 사용자의 회원가입 요청을 처리합니다.
   * @param request - 회원가입 요청 데이터 (CreateUserRequest)
   * @throws ApiException - 이미 존재하는 이메일일 경우 USER_ALREADY_EXISTS 에러 발생
   */
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

  /**
   * verify 함수는 이메일 인증 토큰을 검증하고 회원가입 또는 비밀번호 재설정을 완료합니다.
   * @param token - 이메일 인증 토큰
   * @param type - 인증 유형 ('register' 또는 'reset')
   * @throws ApiException - 토큰이 유효하지 않거나 인증 실패 시 에러 발생
   */
  async verify(token: string, type: string): Promise<void | string> {
    if (!token) {
      throw new ApiException(ErrorCode.VERIFICATION_TOKEN_INVALID);
    }

    if (type === 'register') {
      return await this.verifyRegister(token);
    } else if (type === 'reset') {
      return await this.verifyResetPassword(token);
    }
    throw new ApiException(ErrorCode.VERIFICATION_FAILED);
  }

  /**
   * login 함수는 사용자의 로그인 요청을 처리하고 액세스 토큰과 리프레시 토큰을 생성합니다.
   * @param request - 로그인 요청 데이터 (AuthRequest)
   * @returns - 생성된 액세스 토큰과 리프레시 토큰 (TokenResponse)
   * @throws ApiException - 이메일 또는 비밀번호가 유효하지 않을 경우 INVALID_EMAIL_OR_PASSWORD 에러 발생
   */
  async login(request: AuthRequest): Promise<TokenResponse> {
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

  /**
   * refresh 함수는 리프레시 토큰을 사용하여 새로운 액세스 토큰과 리프레시 토큰을 생성합니다.
   * @param req - HTTP 요청 객체
   * @returns - 생성된 액세스 토큰과 리프레시 토큰 (TokenResponse)
   * @throws ApiException - 리프레시 토큰이 없거나 유효하지 않을 경우 에러 발생
   */
  async refresh(req: Request): Promise<TokenResponse> {
    const oldRefreshToken = req.cookies['eo_rtk'];
    if (!oldRefreshToken) {
      this.LOGGER.warn('리프레시 토큰 쿠키가 없습니다.');
      throw new ApiException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
    }

    const cachedTokens = await this.redis.get(
      RedisKey.cachedTokens(oldRefreshToken),
    );
    if (cachedTokens) {
      return JSON.parse(cachedTokens) as TokenResponse;
    }

    const payload = await this.jwtService
      .verifyAsync(oldRefreshToken, {
        secret: JWT_REFRESH_SECRET_KEY,
      })
      .catch((err) => {
        this.LOGGER.warn(`유효하지 않은 리프레시 토큰: ${err.message}`);
        throw new ApiException(ErrorCode.INVALID_REFRESH_TOKEN);
      });

    const user = await this.userService.findById(payload.id);
    if (!user) throw new ApiException(ErrorCode.USER_NOT_FOUND);

    const redisKey = RedisKey.userRefreshToken(user.id);
    const storedRefreshToken = await this.redis.get(redisKey);

    if (!storedRefreshToken || storedRefreshToken !== oldRefreshToken) {
      throw new ApiException(ErrorCode.INVALID_REFRESH_TOKEN);
    }

    const tokens = await this.generateTokens({
      id: payload.id,
      role: payload.role,
    });

    await Promise.all([
      this.redis.set(redisKey, tokens.refreshToken, 7 * 24 * 60 * 60),
      this.redis.set(
        RedisKey.cachedTokens(oldRefreshToken),
        JSON.stringify(tokens),
        5,
      ),
    ]);
    return tokens;
  }

  /**
   * sendResetPasswordMail 함수는 비밀번호 재설정 이메일을 전송합니다.
   * @param email - 비밀번호 재설정을 요청한 사용자의 이메일
   * @throws ApiException - 사용자가 존재하지 않을 경우 USER_NOT_FOUND 에러 발생
   */
  async sendResetPasswordMail(email: string): Promise<void> {
    const existingUser = await this.userService.findByEmail(email);
    if (!existingUser) {
      throw new ApiException(ErrorCode.USER_NOT_FOUND);
    }

    this.emailService.sendVerificationEmail({
      type: 'reset',
      payload: { email },
    });
  }

  /**
   * resetPassword 함수는 비밀번호 재설정 요청을 처리합니다.
   * @param request - 비밀번호 재설정 요청 데이터 (ResetPasswordRequest)
   * @throws ApiException - 토큰이 유효하지 않거나 사용자가 존재하지 않을 경우 에러 발생
   */
  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    const response = await this.userService.resetPassword(request);
    return response;
  }

  /**
   * verifyRegister 함수는 회원가입 이메일 인증 토큰을 검증하고 사용자를 생성합니다.
   * @param token - 회원가입 이메일 인증 토큰
   * @throws ApiException - 토큰이 유효하지 않거나 이미 존재하는 이메일일 경우 에러 발생
   */
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

  /**
   * generateTokens 함수는 주어진 페이로드를 기반으로 액세스 토큰과 리프레시 토큰을 생성합니다.
   * @param payload - JWT 페이로드 (사용자 ID 및 역할 정보)
   * @returns - 생성된 액세스 토큰과 리프레시 토큰 (TokenResponse)
   */
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

  /**
   * validateUser 함수는 사용자의 이메일과 비밀번호를 검증합니다.
   * @param request - 로그인 요청 데이터 (AuthRequest)
   * @returns - 검증된 사용자 정보
   * @throws ApiException - 이메일 또는 비밀번호가 유효하지 않을 경우 INVALID_EMAIL_OR_PASSWORD 에러 발생
   */
  private async validateUser(request: AuthRequest) {
    const { email, password } = request;
    const user = await this.userService.findByEmail(email);
    if (user && user.password && bcrypt.compareSync(password, user.password)) {
      return user;
    } else {
      throw new ApiException(ErrorCode.INVALID_EMAIL_OR_PASSWORD);
    }
  }

  /**
   * verifyResetPassword 함수는 비밀번호 재설정 이메일 인증 토큰을 검증합니다.
   * @param token - 비밀번호 재설정 이메일 인증 토큰
   * @returns - 검증된 이메일 정보
   * @throws ApiException - 토큰이 유효하지 않을 경우 에러 발생
   */
  private async verifyResetPassword(token: string): Promise<string> {
    const redisKey = RedisKey.verificationReset(token);
    const emailStr = await this.redis.get(redisKey);
    if (!emailStr) {
      throw new ApiException(ErrorCode.VERIFICATION_TOKEN_INVALID);
    }

    const email = JSON.parse(emailStr) as string;

    return email;
  }
}
