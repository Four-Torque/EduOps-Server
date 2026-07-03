import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Prisma } from '@prisma/client';

export class ScheduleItemDto {
  @ApiProperty({
    description: '요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)',
    example: 1,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: '시작 시간 (HH:mm 형식)',
    example: '14:00',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: '종료 시간 (HH:mm 형식)',
    example: '15:30',
  })
  @IsString()
  endTime: string;
}

export class CreateScheduleBulkRequest {
  @ApiProperty({
    description: '강좌 ID',
    example: 'class-uuid',
  })
  @IsString()
  classId: string;

  @ApiProperty({
    description: '등록할 시간표 목록',
    type: [ScheduleItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  schedules: ScheduleItemDto[];

  static toEntities(request: CreateScheduleBulkRequest): Prisma.ScheduleCreateManyInput[] {
    return request.schedules.map((schedule) => ({
      classId: request.classId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    }));
  }
}
