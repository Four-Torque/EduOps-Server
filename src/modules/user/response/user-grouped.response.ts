import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({
    description: '원장님(DIRECTOR) 역할의 유저 목록',
    type: [UserSimpleResponse],
  })
  DIRECTOR?: UserSimpleResponse[];

  @ApiPropertyOptional({
    description: '매니저(MANAGER) 역할의 유저 목록',
    type: [UserSimpleResponse],
  })
  MANAGER?: UserSimpleResponse[];

  @ApiPropertyOptional({
    description: '선생님(TEACHER) 역할의 유저 목록',
    type: [UserSimpleResponse],
  })
  TEACHER?: UserSimpleResponse[];

  // 그 외의 역할이 추가될 경우를 대비한 인덱스 시그니처
  [key: string]: UserSimpleResponse[] | undefined;
}
