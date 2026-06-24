import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserResponse } from '../response/user.response';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findAll(@Param('id') id: string): Promise<UserResponse> {
    const response: UserResponse = await this.userService.findById(id);
    return response;
  }
}
