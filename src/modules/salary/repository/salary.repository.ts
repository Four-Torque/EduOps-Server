import { Injectable } from '@nestjs/common';
import { Prisma, Salary, SalaryStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SalaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  createSalary(data: Prisma.SalaryCreateInput): Promise<Salary> {
    return this.prisma.salary.create({
      data: data,
    });
  }

  findByuserId(userId: string, status?: SalaryStatus): Promise<Salary[]> {
    return this.prisma.salary.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
    });
  }
}
