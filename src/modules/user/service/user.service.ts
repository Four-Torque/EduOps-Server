import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { ApiException, ErrorCode } from 'src/global';
import { UserResponse } from '../response/user.response';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<UserResponse> {
    const user: User | null = await this.userRepository.findById(id);
    if (!user) {
      throw new ApiException(ErrorCode.USER_NOT_FOUND);
    }
    const { password, ...rest } = user;

    const response: UserResponse = UserResponse.fromEntity(rest);
    return response;
  }
}
