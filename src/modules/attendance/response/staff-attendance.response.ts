import { ApiProperty } from '@nestjs/swagger';
import { StaffAttendance } from '@prisma/client';

export class StaffAttendanceResponse {
  @ApiProperty({
    description: '직원 근태 ID',
    example: 'staff-attendance-uuid',
  })
  id: string;

  @ApiProperty({
    description: '근무 날짜',
    example: '2023-12-31T00:00:00.000Z',
  })
  workDate: Date;

  @ApiProperty({
    description: '출근 시간',
    example: '2023-12-31T09:00:00.000Z',
  })
  checkInTime: Date;

  @ApiProperty({
    description: '퇴근 시간',
    example: '2023-12-31T18:00:00.000Z',
  })
  checkOutTime: Date;

  @ApiProperty({
    description: '생성 일자',
    example: '2023-12-31T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 일자',
    example: '2023-12-31T00:00:00.000Z',
  })
  updatedAt: Date;

  static fromEntity(entity: StaffAttendance): StaffAttendanceResponse {
    const response = new StaffAttendanceResponse();
    response.id = entity.id;
    response.workDate = entity.workDate;
    response.checkInTime = entity.checkInTime;
    response.checkOutTime = entity.checkOutTime;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
