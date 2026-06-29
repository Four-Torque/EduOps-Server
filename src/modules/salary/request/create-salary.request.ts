import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSalaryRequest {
  @ApiProperty({
    description: '사용자 ID',
    example: 'user-uuid',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: '기본 급여',
    example: 3000000,
  })
  @IsNumber()
  baseSalary: number;

  @ApiProperty({
    description: '보너스',
    example: 500000,
  })
  @IsNumber()
  bonus: number;

  @ApiProperty({
    description: '급여 지급일',
    example: '2023-12-31T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  paymentDate: Date;

  static toEntity(request: CreateSalaryRequest): Prisma.SalaryCreateInput {
    return {
      User: {
        connect: { id: request.userId },
      },
      baseSalary: request.baseSalary,
      bonus: request.bonus,
      paymentDate: request.paymentDate,
    };
  }
}
