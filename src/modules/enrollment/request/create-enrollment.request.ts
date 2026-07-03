import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEnrollmentRequest {
  @ApiProperty({
    description: '학생 ID',
    example: 'student-uuid',
  })
  @IsString()
  studentId: string;

  @ApiProperty({
    description: '강좌 ID',
    example: 'class-uuid',
  })
  @IsString()
  classId: string;

  @ApiProperty({
    description: '수강 시작일',
    example: '2023-10-31T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  enrollDate: Date;

  @ApiPropertyOptional({
    description: '초기 청구 금액 (입력하지 않으면 강좌의 기본 수강료로 자동 청구됩니다)',
    example: 150000,
  })
  @IsOptional()
  @IsNumber()
  initialAmount?: number;

  @ApiPropertyOptional({
    description: '초기 청구 납부 기한 (입력하지 않으면 수강 시작일 기준 일주일 후로 자동 설정됩니다)',
    example: '2023-11-07T23:59:59.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  initialDueDate?: Date;

  static toEntity(request: CreateEnrollmentRequest): Prisma.EnrollmentCreateInput {
    return {
      student: { connect: { id: request.studentId } },
      class: { connect: { id: request.classId } },
      enrollDate: request.enrollDate,
    };
  }
}
