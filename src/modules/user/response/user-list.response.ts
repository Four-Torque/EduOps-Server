import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from './user.response';

export class PaginatedUserResponse {
  @ApiProperty({
    description: '총 개수',
    example: 23,
  })
  total: number;

  @ApiProperty({
    description: '페이지',
    example: 2,
  })
  page: number;

  @ApiProperty({
    description: '유저 정보',
    type: [UserResponse],
  })
  data: UserResponse[];
}
