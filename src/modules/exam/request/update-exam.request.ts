import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsDate, IsOptional, IsString, Length } from 'class-validator';

export class UpdateExamRequest {
  @ApiProperty({
    description: '시험명',
    example: '기말고사',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 20)
  name?: string;

  @ApiProperty({
    description: '시험일',
    example: '2026-12-15T14:00:00Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  examDate?: Date;

  static toEntity(request: UpdateExamRequest): Prisma.ExamUpdateInput {
    return {
      ...(request.name && { name: request.name }),
      ...(request.examDate && { examDate: request.examDate }),
    };
  }
}
