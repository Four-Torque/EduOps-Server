import { ApiProperty } from '@nestjs/swagger';
import { Role, User, UserStatus } from '@prisma/client';

export class UserResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: 'user-id-1234567890',
  })
  id: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  name: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: '사용자 전화번호',
    example: '010-1234-5678',
  })
  phone: string;

  @ApiProperty({
    description: '사용자 역할',
    example: 'TEACHER | MANAGER | DIRECTOR',
  })
  role: Role;

  @ApiProperty({
    description: '사용자 상태',
    example: 'ACTIVE | INACTIVE | LEAVED',
  })
  status: UserStatus;

  @ApiProperty({
    description: '사용자 생성일',
    example: '2026-06-25 16:27:23.356',
  })
  createdAt: Date;

  @ApiProperty({
    description: '사용자 수정일',
    example: '2026-06-25 16:27:23.356',
  })
  updatedAt: Date;

  static fromEntity(entity: Omit<User, 'password'>): UserResponse {
    const response = new UserResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.email = entity.email;
    response.phone = entity.phone;
    response.role = entity.role;
    response.status = entity.status;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
