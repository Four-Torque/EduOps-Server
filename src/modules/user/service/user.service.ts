import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { ApiException, ErrorCode } from 'src/global';
import { UserResponse } from '../response/user.response';
import { User } from '@prisma/client';
import { CreateUserRequest } from '../request/create-user.request';
import * as bcrypt from 'bcryptjs';
import { ResetPasswordRequest } from 'src/modules/auth/request/reset-password.request';
import { RedisKey, RedisService } from 'src/redis';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly redis: RedisService,
  ) {}

  /**
   * create 메서드는 새로운 사용자를 생성합니다.
   * @param request - 사용자 생성을 위한 요청 객체
   * @returns Promise<User> - 생성된 사용자 객체를 반환합니다.
   */
  async create(request: CreateUserRequest): Promise<User> {
    const hashedPassword = bcrypt.hashSync(request.password, 10);
    const response = await this.userRepository.create(
      CreateUserRequest.toEntity(request, hashedPassword),
    );
    return response;
  }

  /**
   * findById 메서드는 주어진 ID를 가진 사용자를 조회합니다.
   * @param id - 조회할 사용자의 ID
   * @returns Promise<User | null> - 조회된 사용자 객체 또는 null을 반환합니다.
   */
  async findById(id: string): Promise<User | null> {
    const user: User | null = await this.userRepository.findById(id);
    return user;
  }

  /**
   * findByEmail 메서드는 주어진 이메일을 가진 사용자를 조회합니다.
   * @param email - 조회할 사용자의 이메일
   * @returns Promise<User | null> - 조회된 사용자 객체 또는 null을 반환합니다.
   */
  async findByEmail(email: string): Promise<User | null> {
    const user: User | null = await this.userRepository.findByEmail(email);
    return user;
  }

  /**
   * getSession 메서드는 주어진 사용자 ID를 기반으로 세션 정보를 조회합니다.
   * @param userId - 조회할 사용자의 ID
   * @returns Promise<UserResponse> - 조회된 사용자 정보를 UserResponse 형태로 반환합니다.
   * @throws ApiException - 사용자가 존재하지 않을 경우 USER_NOT_FOUND 에러 발생
   */
  async getSession(userId: string): Promise<UserResponse> {
    const user: User | null = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiException(ErrorCode.USER_NOT_FOUND);
    }
    const { password, ...rest } = user;
    const response: UserResponse = UserResponse.fromEntity(rest);
    return response;
  }

  /**
   * resetPassword 메서드는 사용자의 비밀번호를 재설정합니다.
   * @param request - 비밀번호 재설정을 위한 요청 객체
   * @throws ApiException - 토큰이 유효하지 않거나 사용자가 존재하지 않을 경우 예외를 발생시킵니다.
   * @returns Promise<void> - 비밀번호 재설정이 성공적으로 완료되면 void를 반환합니다.
   */
  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    const { email, token, newPassword } = request;
    const redisKey = RedisKey.verificationReset(token);
    if (!token || !(await this.redis.get(redisKey))) {
      throw new ApiException(ErrorCode.VERIFICATION_TOKEN_INVALID);
    }
    const user = await this.findByEmail(email);
    if (!user) {
      throw new ApiException(ErrorCode.USER_NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.resetPassword(
      ResetPasswordRequest.toEntity(user.id, hashedPassword),
    );
    await this.redis.del(redisKey);
  }
}
