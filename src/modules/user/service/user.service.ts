import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { ApiException, ErrorCode } from 'src/global';
import { UserResponse } from '../response/user.response';
import { User } from '@prisma/client';
import { CreateUserRequest } from '../request/create-user.request';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
}
