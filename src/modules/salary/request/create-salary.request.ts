import { Prisma } from '@prisma/client';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSalaryRequest {
  @IsString()
  userId: string;

  @IsNumber()
  baseSalary: number;

  @IsNumber()
  bonus: number;

  @IsDate()
  @IsOptional()
  paymentDate: Date;

  static toEntity(request: CreateSalaryRequest): Prisma.SalaryCreateInput {
    return {
      user: {
        connect: { id: request.userId },
      },
      baseSalary: request.baseSalary,
      bonus: request.bonus,
      paymentDate: request.paymentDate,
    };
  }
}
