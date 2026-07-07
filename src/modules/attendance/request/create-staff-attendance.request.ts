import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsOptional } from 'class-validator';

export class CreateStaffAttendanceRequest {
  @ApiProperty({
    description: '근무 날짜',
    example: '2023-10-01',
  })
  @IsOptional()
  workDate?: string;

  @ApiProperty({
    description: '체크인 시간',
    example: '2023-10-01T09:00:00Z',
  })
  @IsOptional()
  checkInTime?: Date;

  static toEntity(
    userId: string,
    request: CreateStaffAttendanceRequest,
  ): Prisma.StaffAttendanceCreateInput {
    return {
      user: { connect: { id: userId } },
      workDate: request.workDate,
      checkInTime: request.checkInTime,
    };
  }
}
