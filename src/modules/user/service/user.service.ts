import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { ApiException, ErrorCode } from 'src/global';
import { UserResponse } from '../response/user.response';
import { Role, User, UserStatus } from '@prisma/client';
import { CreateUserRequest } from '../request/create-user.request';
import * as bcrypt from 'bcryptjs';
import { ResetPasswordRequest } from 'src/modules/auth/request/reset-password.request';
import { RedisKey, RedisService } from 'src/redis';
import { PaginatedUserResponse } from '../response/user-list.response';
import { UpdateUserRequest } from '../request/update-user.request';

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
   * findByPhone 메서드는 주어진 전화번호를 가진 사용자를 조회합니다.
   * @param phone - 조회할 사용자의 전화번호
   * @returns Promise<User | null> - 조회된 사용자 객체 또는 null을 반환합니다.
   */
  async;
  findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findByPhone(phone);
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

  /**
   * getUserList 메서드는 유저의 목록을 조회합니다
   * @param role
   * @param status
   * @param page
   * @param limit
   * @returns
   */
  async getList(
    role: Role,
    status: UserStatus,
    page: number,
    limit: number,
  ): Promise<PaginatedUserResponse> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userRepository.findList(role, status, skip, limit),
      this.userRepository.countList(role, status),
    ]);

    return {
      total,
      page,
      data: users.map((user) => UserResponse.fromEntity(user)),
    };
  }

  /**
   * updateUser 메서드는 사용자의 특정 정보를 수정/업데이트합니다
   * @param id
   * @param request
   * @returns
   */
  async update(id: string, request: UpdateUserRequest): Promise<UserResponse> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new ApiException(ErrorCode.USER_NOT_FOUND);
    }

    const data = UpdateUserRequest.toEntity(request);
    const updated = await this.userRepository.update(id, data);

    const response: UserResponse = UserResponse.fromEntity(updated);
    return response;
  }

  /**
   * delete 메서드는 사용자의 정보를 완전 삭제합니다
   * @param id
   */
  async delete(id: string): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new ApiException(ErrorCode.USER_NOT_FOUND);
    }

    await this.userRepository.delete(id);
  }
}
