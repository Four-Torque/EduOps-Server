import { ApiProperty } from '@nestjs/swagger';
import { StudentAttendance, StudentAttendanceStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class StudentAttendanceResponse {
  @ApiProperty({
    description: '학생 출결 ID',
    example: 'student-attendance-uuid',
  })
  @IsString()
  id: string;

  //@TODO 아마 학생 객체로 넘겨주는걸로 바뀌지 않을까함
  @ApiProperty({
    description: '학생 ID',
    example: 'student-uuid',
  })
  @IsString()
  studentId: string;

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

  static fromEntity(entity: StudentAttendance): StudentAttendanceResponse {
    const response = new StudentAttendanceResponse();
    response.id = entity.id;
    response.studentId = entity.studentId;
    response.lectureDate = entity.lectureDate;
    response.status = entity.status;

    return response;
  }
}
