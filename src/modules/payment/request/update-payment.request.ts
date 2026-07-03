import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType } from '@prisma/client';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePaymentRequest {
  @ApiPropertyOptional({
    description: '청구 제목 변경',
    example: '11월 기초수학 수강료',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: '결제 상태 변경 (PAID, UNPAID, REFUNDED)',
    enum: PaymentType,
    example: PaymentType.PAID,
  })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @ApiPropertyOptional({
    description: '실제 결제/환불 일시 (입력하지 않고 상태만 PAID로 보내면 서버가 현재 시간 자동 기록)',
    example: '2023-11-01T15:30:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDate?: Date;

  @ApiPropertyOptional({
    description: '청구 금액 변경',
    example: 120000,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    description: '납부 기한 변경',
    example: '2023-11-15T23:59:59.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;
}
