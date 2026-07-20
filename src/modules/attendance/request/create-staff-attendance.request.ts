import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { formatDate } from 'src/global';

export class CreateStaffAttendanceRequest {
  @ApiProperty({
    description: '근무일',
    example: '2023-10-01',
  })
  @IsOptional()
  workDate?: Date;

  @ApiProperty({
    description: '체크인 시간',
    example: '2023-10-01T09:00:00Z',
  })
  @IsOptional()
  checkInTime?: Date;

  @ApiProperty({
    description: '직원 User ID',
    example: 'user-uuid',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  static toEntity(
    request: CreateStaffAttendanceRequest,
  ): Prisma.StaffAttendanceCreateInput {
    const { checkInTime, userId, workDate } = request;
    const resolvedCheckIn = checkInTime ? new Date(checkInTime) : new Date();
    return {
      user: { connect: { id: userId } },
      workDate: formatDate(workDate || resolvedCheckIn),
      checkInTime: resolvedCheckIn,
    };
  }
}

