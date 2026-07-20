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

  @ApiProperty({
    description: '반 이름',
    example: '초등 A',
  })
  className: string;

  @ApiProperty({
    description: '평균 점수',
    example: 85,
  })
  averageScore: number;

  @ApiProperty({
    description: '응시 인원',
    example: 12,
  })
  attendees: number;

  @ApiProperty({
    description: '전체 인원',
    example: 15,
  })
  totalStudents: number;

  @ApiProperty({
    description: '상태',
    example: '채점완료',
    enum: ['채점전', '채점중', '채점완료'],
  })
  status: string;

  static fromEntity(
    entity: Exam & {
      class?: { name: string; enrollments?: any[] };
      examResults?: { score: number }[];
    },
  ): ExamResponse {
    const response = new ExamResponse();
    response.id = entity.id;
    response.classId = entity.classId;
    response.name = entity.name;
    response.examDate = entity.examDate;
    response.createdAt = entity.createdAt;

    // Default Values
    response.className = "";
    response.totalStudents = 0;
    response.attendees = 0;
    response.averageScore = 0;
    response.status = "채점전";

    if (entity.class) {
      response.className = entity.class.name;
      if (entity.class.enrollments) {
        response.totalStudents = entity.class.enrollments.length;
      }
    }

    if (entity.examResults && entity.examResults.length > 0) {
      response.attendees = entity.examResults.length;
      
      const sum = entity.examResults.reduce((acc, curr) => acc + curr.score, 0);
      response.averageScore = Math.round(sum / response.attendees);
    }

    if (response.attendees === 0) {
      response.status = '채점전';
    } else if (response.totalStudents > 0 && response.attendees < response.totalStudents) {
      response.status = '채점중';
    } else if (response.attendees > 0) {
      response.status = '채점완료';
    }

    return response;
  }
}
