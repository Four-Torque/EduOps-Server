import { ApiProperty } from '@nestjs/swagger';
import { Prisma, Role, UserStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserRequest {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '사용자 전화번호',
    example: '010-1234-5678',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: '사용자 역할',
    example: Role.DIRECTOR,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({
    description: '사용자 상태',
    example: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  static toEntity(request: UpdateUserRequest): Prisma.UserUpdateInput {
    return {
      ...(request.name && { name: request.name }),
      ...(request.phone && { phone: request.phone }),
      ...(request.role && { role: request.role }),
      ...(request.status && { status: request.status }),
    };
  }
}
