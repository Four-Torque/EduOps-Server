import { ApiProperty } from '@nestjs/swagger';
import { SalaryStatus } from '@prisma/client';
import { IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class UpdateSalaryRequest {
  @ApiProperty({
    description: '기본 급여',
    example: 3000000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  baseSalary?: number;

  @ApiProperty({
    description: '보너스',
    example: 500000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  bonus?: number;

  @ApiProperty({
    description: '급여 지급일',
    example: '2023-12-31T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  paymentDate?: Date;

  @ApiProperty({
    description: '지급 상태',
    enum: SalaryStatus,
    required: false,
  })
  @IsEnum(SalaryStatus)
  @IsOptional()
  status?: SalaryStatus;
}
