import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Enrollment, Student, StudentAttendance, StudentAttendanceStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ClassStudentAttendanceResponse {
  @ApiProperty({
    description: '학생 ID',
    example: 'student-uuid',
  })
  @IsString()
  studentId: string;

  @ApiProperty({
    description: '학생 이름',
    example: '홍길동',
  })
  @IsString()
  studentName: string;

  @ApiPropertyOptional({
    description: '출결 기록 ID (아직 출석 체크 전이면 null)',
    example: 'attendance-uuid',
  })
  @IsOptional()
  @IsString()
  attendanceId: string | null;

  @ApiPropertyOptional({
    description: '수업일',
    example: '2023-10-31',
  })
  @IsOptional()
  @IsString()
  lectureDate: string | null;

  @ApiPropertyOptional({
    description: '출결 상태 (아직 출석 체크 전이면 null)',
    example: StudentAttendanceStatus.ATTENDED,
    enum: StudentAttendanceStatus,
  })
  @IsOptional()
  @IsEnum(StudentAttendanceStatus)
  status: StudentAttendanceStatus | null;

  static fromEntities(
    enrollments: (Enrollment & { student: Student })[],
    attendances: StudentAttendance[],
  ): ClassStudentAttendanceResponse[] {
    return enrollments.map((enrollment) => {
      const studentId = enrollment.student.id;
      const attendance = attendances.find((a) => a.studentId === studentId);

      const response = new ClassStudentAttendanceResponse();
      response.studentId = studentId;
      response.studentName = enrollment.student.name;
      response.attendanceId = attendance?.id || null;
      response.lectureDate = attendance?.lectureDate || null;
      response.status = attendance?.status || null;

      return response;
    });
  }
}
