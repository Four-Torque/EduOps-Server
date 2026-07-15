import { ApiProperty } from '@nestjs/swagger';
import { PaymentType } from '@prisma/client';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class PaymentFilterRequest {
  @ApiProperty({
    description: '학생 ID',
    required: false,
    type: String,
    example: 'uuid-1234',
  })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({
    description: '수업 ID',
    required: false,
    type: String,
    example: 'uuid-5678',
  })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({
    description: '결제 유형',
    required: false,
    enum: PaymentType,
  })
  @IsOptional()
  paymentType?: PaymentType;

  @ApiProperty({
    description: '검색어',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;
  @ApiProperty({
    description: '결제 유형 필터',
    required: false,
    enum: ['all', 'INCOME', 'EXPENSE'],
  })
  @IsOptional()
  @IsString()
  type?: 'all' | 'INCOME' | 'EXPENSE';
  @ApiProperty({
    description: '페이지 번호',
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  page?: number;
  @ApiProperty({
    description: '페이지 크기',
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
