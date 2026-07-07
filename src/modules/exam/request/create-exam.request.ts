import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsDate, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateExamRequest {
  @ApiProperty({
    description: '강좌 ID',
    example: 'class-uuid-1234',
  })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({
    description: '시험명',
    example: '중간고사',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  name: string;

  @ApiProperty({
    description: '시험일',
    example: '2026-10-15T14:00:00Z',
  })
  @IsDate()
  @IsNotEmpty()
  examDate: Date;

  static toEntity(request: CreateExamRequest): Prisma.ExamCreateInput {
    return {
      name: request.name,
      examDate: request.examDate,
      class: {
        connect: { id: request.classId },
      },
    };
  }
}
