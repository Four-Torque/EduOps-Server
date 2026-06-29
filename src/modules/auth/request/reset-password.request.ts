import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordRequest {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '비밀번호 재설정 토큰',
    example: 'uuid-token-1234567890',
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: '새로운 비밀번호',
    example: 'newPassword123',
  })
  @IsNotEmpty()
  newPassword: string;

  static toEntity(userId: string, newPassword: string): Prisma.UserUpdateArgs {
    return {
      where: {
        id: userId,
      },
      data: {
        password: newPassword,
      },
    };
  }
}
