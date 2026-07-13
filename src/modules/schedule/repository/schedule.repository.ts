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
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
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

  async findOverlappingForTeacher(
    teacherId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ): Promise<Schedule | null> {
    return this.prisma.schedule.findFirst({
      where: {
        class: {
          teacherId,
        },
        dayOfWeek,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
  }

  async findOverlappingForRoom(
    room: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ): Promise<Schedule | null> {
    return this.prisma.schedule.findFirst({
      where: {
        room,
        dayOfWeek,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
  }

  async getStudentIdsByClassId(classId: string): Promise<string[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId },
      select: { studentId: true },
    });
    return enrollments.map((e) => e.studentId);
  }

  async findOverlappingForStudents(
    classId: string,
    studentIds: string[],
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ): Promise<Schedule | null> {
    if (studentIds.length === 0) return null;

    // 다른강좌이면서 학생포함되면서 요일도 같아야하고 시간이 1분이라도 겹쳐야한다
    return this.prisma.schedule.findFirst({
      where: {
        classId: { not: classId },
        class: {
          enrollments: {
            some: {
              studentId: { in: studentIds },
            },
          },
        },
        dayOfWeek,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
  }
}
