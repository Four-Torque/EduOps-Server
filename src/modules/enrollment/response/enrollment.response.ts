import { ApiProperty } from '@nestjs/swagger';
import { Enrollment } from '@prisma/client';

export class EnrollmentResponse {
  @ApiProperty({
    description: '수강 등록 ID',
    example: 'enrollment-uuid',
  })
  id: string;

  @ApiProperty({
    description: '강좌 ID',
    example: 'class-uuid',
  })
  classId: string;

  @ApiProperty({
    description: '학생 ID',
    example: 'student-uuid',
  })
  studentId: string;

  @ApiProperty({
    description: '수강 시작일',
    example: '2023-10-31T00:00:00.000Z',
  })
  enrollDate: Date;

  @ApiProperty({
    description: '생성 일시',
    example: '2023-10-31T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 일시',
    example: '2023-10-31T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '학생 이름',
    example: '홍길동',
    required: false,
  })
  studentName?: string;

  @ApiProperty({
    description: '강좌 이름',
    example: '수학영재반',
    required: false,
  })
  className?: string;

  static fromEntity(
    entity: Enrollment & { student?: { name: string }; class?: { name: string } },
  ): EnrollmentResponse {
    const response = new EnrollmentResponse();
    response.id = entity.id;
    response.classId = entity.classId;
    response.studentId = entity.studentId;
    response.enrollDate = entity.enrollDate;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;

    if (entity.student) {
      response.studentName = entity.student.name;
    }
    if (entity.class) {
      response.className = entity.class.name;
    }

    return response;
  }
}
