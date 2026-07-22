import { ApiProperty } from '@nestjs/swagger';
import { Prisma, EmploymentStatus, Role, UserStatus } from '@prisma/client';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateUserRequest {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '사용자 전화번호',
    example: '010-1234-5678',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: '사용자 비밀번호',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password: string;

  @ApiProperty({
    description: '역할',
    example: 'TEACHER',
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({
    description: '근로 상태',
    example: 'WORKING',
    required: false,
  })
  @IsEnum(EmploymentStatus)
  @IsOptional()
  employmentStatus?: EmploymentStatus;

  @ApiProperty({
    description: '사용자 상태',
    example: 'ACTIVE',
    required: false,
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiProperty({
    description: '입사일',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  joinedAt?: Date;

  @ApiProperty({
    description: '퇴사일',
    example: '2026-07-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  resignedAt?: Date;

  static toEntity(
    request: CreateUserRequest,
    hashedPassword: string,
  ): Prisma.UserCreateInput {
    return {
      email: request.email,
      name: request.name,
      phone: request.phone,
      password: hashedPassword,
      ...(request.role && { role: request.role }),
      ...(request.employmentStatus && {
        employmentStatus: request.employmentStatus,
      }),
      ...(request.status && { status: request.status }),
      ...(request.joinedAt && { joinedAt: request.joinedAt }),
    };
  }
}
