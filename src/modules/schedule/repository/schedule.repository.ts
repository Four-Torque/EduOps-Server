import { Injectable } from '@nestjs/common';
import { Prisma, Schedule } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ScheduleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(data: Prisma.ScheduleCreateManyInput[]): Promise<number> {
    const result = await this.prisma.schedule.createMany({
      data,
    });
    return result.count;
  }

  async findByClassId(classId: string): Promise<Schedule[]> {
    return this.prisma.schedule.findMany({
      where: { classId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async findById(id: string): Promise<Schedule | null> {
    return this.prisma.schedule.findUnique({
      where: { id },
    });
  }

  async delete(id: string): Promise<Schedule> {
    return this.prisma.schedule.delete({
      where: { id },
    });
  }

  async deleteByClassId(classId: string): Promise<number> {
    const result = await this.prisma.schedule.deleteMany({
      where: { classId },
    });
    return result.count;
  }
}
