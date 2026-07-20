import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { formatDate } from 'src/global';

export class UpdateStaffAttendanceRequest {
  @ApiProperty({
    description: '체크인 시간',
    example: '2023-10-01T09:00:00Z',
  })
  @IsOptional()
  checkInTime?: Date;

  @ApiProperty({
    description: '근무일',
    example: '2023-10-01',
  })
  @IsOptional()
  workDate?: Date;

  @ApiProperty({
    description: '체크아웃 시간',
    example: '2023-10-01T09:00:00Z',
  })
  @IsOptional()
  checkOutTime?: Date;

  @ApiProperty({
    description: '직원 User ID',
    example: 'user-uuid',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  static toEntity(
    request: UpdateStaffAttendanceRequest,
  ): Prisma.StaffAttendanceUpdateInput {
    const { checkInTime, checkOutTime, workDate, userId } = request;
    const data: Prisma.StaffAttendanceUpdateInput = {};

    if (userId) {
      data.user = { connect: { id: userId } };
    }
    if (checkInTime !== undefined) {
      data.checkInTime = checkInTime;
    }
    if (checkOutTime !== undefined) {
      data.checkOutTime = checkOutTime;
    }
    if (workDate !== undefined) {
      data.workDate = formatDate(workDate);
    }
    return data;
  }
}

