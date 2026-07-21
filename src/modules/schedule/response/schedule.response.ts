import { ApiProperty } from '@nestjs/swagger';
import { Class, Schedule } from '@prisma/client';

type ScheduleWithClass = Schedule & {
  class: Class & { teacher?: { name: string } | null };
};

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
    description: '강좌명',
    example: '수학영재반',
    required: false,
  })
  className?: string;

  @ApiProperty({
    description: '담당 강사명',
    example: '루돌프',
    required: false,
  })
  instructor?: string;

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

  @ApiProperty({
    description: '강좌 시작일 (이 날짜 이전 주차는 시간표에 표시하지 않는다)',
    example: '2023-10-31T00:00:00.000Z',
    required: false,
  })
  classStartDate?: Date | null;

  @ApiProperty({
    description: '강좌 종료일 (이 날짜 이후 주차는 시간표에 표시하지 않는다)',
    example: '2023-11-31T00:00:00.000Z',
    required: false,
  })
  classEndDate?: Date | null;

  static fromEntity(entity: Schedule | ScheduleWithClass): ScheduleResponse {
    const response = new ScheduleResponse();
    response.id = entity.id;
    response.classId = entity.classId;
    response.dayOfWeek = entity.dayOfWeek;
    response.startTime = entity.startTime;
    response.endTime = entity.endTime;
    response.room = entity.room;

    if ('class' in entity && entity.class) {
      response.className = entity.class.name;
      response.instructor = entity.class.teacher?.name || '미지정';
      response.classStartDate = entity.class.startDate;
      response.classEndDate = entity.class.endDate;
    }

    return response;
  }
}
