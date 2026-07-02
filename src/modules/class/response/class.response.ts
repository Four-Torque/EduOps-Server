import { ApiProperty } from '@nestjs/swagger';
import { Class, ClassStatus } from '@prisma/client';
import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';

export class ClassResponse {
  @ApiProperty({
    description: '강좌 ID',
    example: 'class-uuid',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '교사 ID',
    example: 'user-uuid',
  })
  @IsString()
  teacherId: string;

  @ApiProperty({
    description: '강좌 명',
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
    example: '2023-11-31T00:00:00.000Z',
  })
  @IsDate()
  endDate: Date;

  @ApiProperty({
    description: '강좌 상태',
    example: ClassStatus,
  })
  @IsEnum(ClassStatus)
  status: ClassStatus;

  @ApiProperty({
    description: '생성 일자',
    example: '2023-12-31T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: '수정 일자',
    example: '2023-12-31T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;

  static fromEntity(entity: Class): ClassResponse {
    const response = new ClassResponse();
    response.id = entity.id;
    response.teacherId = entity.teacherId;
    response.name = entity.name;
    response.fee = entity.fee;
    response.startDate = entity.startDate;
    response.endDate = entity.endDate;
    response.status = entity.status;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;

    return response;
  }
}
