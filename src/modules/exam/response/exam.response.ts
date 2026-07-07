import { ApiProperty } from '@nestjs/swagger';
import { Exam } from '@prisma/client';

export class ExamResponse {
  @ApiProperty({
    description: '시험 ID',
    example: 'exam-uuid-1234',
  })
  id: string;

  @ApiProperty({
    description: '강좌 ID',
    example: 'class-uuid-1234',
  })
  classId: string;

  @ApiProperty({
    description: '시험명',
    example: '중간고사',
  })
  name: string;

  @ApiProperty({
    description: '시험일',
    example: '2026-10-15T14:00:00Z',
  })
  examDate: Date | null;

  @ApiProperty({
    description: '생성일시',
  })
  createdAt: Date;

  static fromEntity(entity: Exam): ExamResponse {
    const response = new ExamResponse();
    response.id = entity.id;
    response.classId = entity.classId;
    response.name = entity.name;
    response.examDate = entity.examDate;
    response.createdAt = entity.createdAt;
    return response;
  }
}
