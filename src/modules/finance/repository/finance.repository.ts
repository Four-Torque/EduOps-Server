import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FinanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getWeeklyFinance(startDate: string, endDate: string) {}
}
