import { ApiProperty } from '@nestjs/swagger';
import { Prisma, StudentStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class UpdateStudentRequest {
  @ApiProperty({
    description: '학생 이름',
    example: '사나이',
  })
  @IsString()
  name?: string;

  @ApiProperty({
    description: '전화번호(학생 or 부모)',
    example: '010-1234-5678',
  })
  @IsString()
  phone?: string;

  @ApiProperty({
    description: '상태',
    example: StudentStatus.ENROLLED,
  })
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiProperty({
    description: '주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  @IsString()
  address?: string;

  static toEntity(request: UpdateStudentRequest): Prisma.StudentUpdateInput {
    return {
      ...(request.name && { name: request.name }),
      ...(request.phone && { phone: request.phone }),
      ...(request.address && { address: request.address }),
      ...(request.status && { status: request.status }),
    };
  }
}
