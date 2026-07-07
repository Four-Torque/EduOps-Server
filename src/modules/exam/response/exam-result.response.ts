import { ApiProperty } from '@nestjs/swagger';
import { ExamResult } from '@prisma/client';

export class ExamResultResponse {
  @ApiProperty({
    description: '결과 ID',
    example: 'result-uuid-1234',
  })
  id: string;

  @ApiProperty({
    description: '학생 ID',
    example: 'student-uuid-1234',
  })
  studentId: string;

  @ApiProperty({
    description: '학생 이름',
    example: '홍길동',
  })
  studentName?: string;

  @ApiProperty({
    description: '점수',
    example: 95,
  })
  score: number;

  static fromEntity(
    entity: ExamResult & { student?: { name: string } },
  ): ExamResultResponse {
    const response = new ExamResultResponse();
    response.id = entity.id;
    response.studentId = entity.studentId;
    response.score = entity.score;
    if (entity.student) {
      response.studentName = entity.student.name;
    }
    return response;
  }
}
