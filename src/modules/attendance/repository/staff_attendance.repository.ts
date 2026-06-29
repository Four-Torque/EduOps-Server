import { Injectable } from '@nestjs/common';
import { Prisma, Salary, SalaryStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StaffAttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}
}
