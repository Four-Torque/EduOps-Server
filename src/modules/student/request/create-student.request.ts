import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsString } from 'class-validator';

export class CreateStudentRequest {
  @ApiProperty({
    description: '학생 이름',
    example: '사나이',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '전화번호(학생 or 부모)',
    example: '010-1234-5678',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: '생년월일',
    example: '1950-01-01',
  })
  @IsString()
  birth: string;

  @ApiProperty({
    description: '주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  @IsString()
  address: string;

  static toEntity(request: CreateStudentRequest): Prisma.StudentCreateInput {
    return {
      name: request.name,
      phone: request.phone,
      birth: request.birth,
      address: request.address,
    };
  }
}
