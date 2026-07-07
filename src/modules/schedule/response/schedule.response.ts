import { ApiProperty } from '@nestjs/swagger';
import { Schedule } from '@prisma/client';

export class ScheduleResponse {
  @ApiProperty({
    description: '시간표 ID',
    example: 'schedule-uuid',
  })
  id: string;

  @ApiProperty({
    description: '강좌 ID',
    example: 'class-uuid',
  })
  classId: string;

  @ApiProperty({
    description: '요일 (0: 일요일 ~ 6: 토요일)',
    example: 1,
  })
  dayOfWeek: number;

  @ApiProperty({
    description: '시작 시간 (HH:mm)',
    example: '14:00',
  })
  startTime: string;

  @ApiProperty({
    description: '종료 시간 (HH:mm)',
    example: '15:30',
  })
  endTime: string;

  @ApiProperty({
    description: '강의실',
    example: '101호',
  })
  room: string;

  static fromEntity(entity: Schedule): ScheduleResponse {
    const response = new ScheduleResponse();
    response.id = entity.id;
    response.classId = entity.classId;
    response.dayOfWeek = entity.dayOfWeek;
    response.startTime = entity.startTime;
    response.endTime = entity.endTime;
    response.room = entity.room;
    return response;
  }
}
