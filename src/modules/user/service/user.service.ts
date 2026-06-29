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

  async create(request: CreateUserRequest): Promise<User> {
    const hashedPassword = bcrypt.hashSync(request.password, 10);
    const response = await this.userRepository.create(
      CreateUserRequest.toEntity(request, hashedPassword),
    );
    return response;
  }

  async findById(id: string): Promise<UserResponse> {
    const user: User | null = await this.userRepository.findById(id);
    if (!user) {
      throw new ApiException(ErrorCode.USER_NOT_FOUND);
    }
    const { password, ...rest } = user;

    const response: UserResponse = UserResponse.fromEntity(rest);
    return response;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user: User | null = await this.userRepository.findByEmail(email);
    return user;
  }

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    const { email, token, newPassword } = request;
    const redisKey = RedisKey.verificationReset(token);
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
