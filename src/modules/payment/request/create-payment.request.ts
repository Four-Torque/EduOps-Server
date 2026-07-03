import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, PaymentType } from '@prisma/client';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentRequest {
  @ApiProperty({
    description: '강좌 ID',
    example: 'class-uuid',
  })
  @IsString()
  classId: string;

  @ApiProperty({
    description: '학생 ID',
    example: 'student-uuid',
  })
  @IsString()
  studentId: string;

  @ApiProperty({
    description: '청구 금액',
    example: 150000,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: '납부 기한',
    example: '2023-11-30T23:59:59.000Z',
  })
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @ApiPropertyOptional({
    description: '초기 결제 상태 (기본값: UNPAID)',
    enum: PaymentType,
    example: PaymentType.UNPAID,
  })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  static toEntity(request: CreatePaymentRequest): Prisma.PaymentCreateInput {
    return {
      class: { connect: { id: request.classId } },
      student: { connect: { id: request.studentId } },
      amount: request.amount,
      dueDate: request.dueDate,
      ...(request.paymentType && { paymentType: request.paymentType }),
    };
  }
}
