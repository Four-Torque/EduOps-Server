import { ApiProperty } from '@nestjs/swagger';
import { Salary, SalaryStatus } from '@prisma/client';

export class SalaryResponse {
  @ApiProperty({
    description: '급여 ID',
    example: 'salary-uuid',
  })
  id: string;

  @ApiProperty({
    description: '기본 급여',
    example: 3000000,
  })
  baseSalary: number;

  @ApiProperty({
    description: '보너스',
    example: 500000,
  })
  bonus: number;

  @ApiProperty({
    description: '급여 상태',
    example: SalaryStatus.PENDING,
  })
  status: SalaryStatus;

  @ApiProperty({
    description: '급여 지급일',
    example: '2023-12-31T00:00:00.000Z',
    required: false,
  })
  paymentDate: Date;

  @ApiProperty({
    description: '생성 일자',
    example: '2023-12-31T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 일자',
    example: '2023-12-31T00:00:00.000Z',
  })
  updatedAt: Date;

  static fromEntity(entity: Salary): SalaryResponse {
    const response = new SalaryResponse();
    response.id = entity.id;
    response.baseSalary = entity.baseSalary;
    response.bonus = entity.bonus;
    response.status = entity.status;
    response.paymentDate = entity.paymentDate;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
