import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserSimpleResponse {
  @ApiProperty({ description: '사용자 ID', example: 'user-uuid' })
  id: string;

  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  name: string;

  @ApiProperty({ description: '사용자 전화번호', example: '010-1234-5678' })
  phone: string;

  @ApiProperty({ description: '사용자 이메일', example: 'test@example.com' })
  email: string;

  static fromEntity(entity: User): UserSimpleResponse {
    const response = new UserSimpleResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.phone = entity.phone;
    response.email = entity.email;
    return response;
  }
}

export class UserGroupedResponse {
  @ApiProperty({
    description: '역할',
    example: 'DIRECTOR',
  })
  role?: string;

  @ApiProperty({
    description: '역할별 유저 목록',
    type: [UserSimpleResponse],
  })
  contacts: UserSimpleResponse[];

  static fromEntity(role: string, entities: User[]): UserGroupedResponse {
    const response = new UserGroupedResponse();
    response.role = role;
    response.contacts = entities.map((entity) =>
      UserSimpleResponse.fromEntity(entity),
    );
    return response;
  }
}
