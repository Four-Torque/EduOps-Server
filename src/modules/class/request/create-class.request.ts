import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateClassRequest {
  @ApiProperty({
    description: '교사 ID',
    example: 'user-uuid',
  })
  @IsString()
  teacherId: string;

  @ApiProperty({
    description: '강좌명',
    example: '수학영재반',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '강좌 비용',
    example: '450000',
  })
  @IsNumber()
  fee: number;

  @ApiProperty({
    description: '강좌 시작일',
    example: '2023-10-31T00:00:00.000Z',
  })
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: '강좌 종료일',
    example: '2023-10-31T00:00:00.000Z',
  })
  @IsDate()
  endDate: Date;

  static toEntity(request: CreateClassRequest): Prisma.ClassCreateInput {
    return {
      teacher: { connect: { id: request.teacherId } },
      name: request.name,
      fee: request.fee,
      startDate: request.startDate,
      endDate: request.endDate,
    };
  }
}
