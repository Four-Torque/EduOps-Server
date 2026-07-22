import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from './user.response';
import { User } from '@prisma/client';

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

  @ApiProperty({ description: '총 페이지 수', example: 10 })
  totalPages: number;

  public static fromEntity(
    page: number,
    total: number,
    totalPages: number,
    entity: User[],
  ): PaginatedUserResponse {
    const response = new PaginatedUserResponse();
    response.page = page;
    response.total = total;
    response.totalPages = totalPages;
    response.data = entity.map((user) => UserResponse.fromEntity(user));
    return response;
  }
}
