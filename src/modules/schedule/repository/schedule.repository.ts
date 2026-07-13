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

  async findAll(
    classId?: string,
    room?: string,
    teacherName?: string,
    subject?: string,
  ): Promise<any[]> {
    const where: Prisma.ScheduleWhereInput = {
      ...(classId && { classId }),
      ...(room && { room }),
    };

    const classWhere: Prisma.ClassWhereInput = {};

    if (teacherName) {
      classWhere.teacher = {
        name: {
          contains: teacherName,
          mode: 'insensitive',
        },
      };
    }

    if (subject && subject !== 'all') {
      const subjectMap: Record<string, string> = {
        math: '수학',
        english: '영어',
        korean: '국어',
        science: '과학',
        history: '역사',
        socialStudies: '사회',
        art: '미술',
        music: '음악',
        physicalEducation: '체육',
        it: '정보',
        foreignLanguage: '외국어',
      };

      const subjectKeyword = subjectMap[subject];
      if (subjectKeyword) {
        classWhere.name = {
          contains: subjectKeyword,
          mode: 'insensitive',
        };
      }
    }

    if (Object.keys(classWhere).length > 0) {
      where.class = classWhere;
    }

    return this.prisma.schedule.findMany({
      where,
      include: {
        class: {
          include: {
            teacher: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }
}
