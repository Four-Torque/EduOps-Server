import { ApiProperty } from '@nestjs/swagger';
import { ClassStatus, Prisma } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateClassRequest {
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
  @IsOptional()
  name: string;

  @ApiProperty({
    description: '강좌 비용',
    example: '450000',
  })
  @IsNumber()
  @IsOptional()
  fee: number;

  @ApiProperty({
    description: '강좌 시작일',
    example: '2023-10-31T00:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  startDate: Date;

  @ApiProperty({
    description: '강좌 종료일',
    example: '2023-10-31T00:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  endDate: Date;

  @ApiProperty({
    description: '강좌 상태',
    example: ClassStatus,
  })
  @IsEnum(ClassStatus)
  @IsOptional()
  status: ClassStatus;

  static toEntity(request: UpdateClassRequest): Prisma.ClassUpdateInput {
    return {
      teacher: { connect: { id: request.teacherId } },
      name: request.name,
      fee: request.fee,
      startDate: request.startDate,
      endDate: request.endDate,
      status: request.status,
    };
  }
}
