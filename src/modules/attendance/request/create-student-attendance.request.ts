import { ApiProperty } from '@nestjs/swagger';
import { Prisma, StudentAttendanceStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateStudentAttendanceRequest {
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

  @IsString()
  @ApiProperty({
    description: '수업일',
    example: '1920-10-10',
  })
  lectureDate: string;

  @ApiProperty({
    description: '학생 출결 상태',
    example: StudentAttendanceStatus.ABSENT,
  })
  @IsEnum(StudentAttendanceStatus)
  status: StudentAttendanceStatus;

  static toEntity(
    request: CreateStudentAttendanceRequest,
  ): Prisma.StudentAttendanceCreateInput {
    return {
      student: { connect: { id: request.studentId } },
      class: { connect: { id: request.classId } },
      lectureDate: request.lectureDate,
      status: request.status,
    };
  }
}
