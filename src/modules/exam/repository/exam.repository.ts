import { Injectable } from '@nestjs/common';
import { Prisma, Exam } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ExamCreateInput): Promise<Exam> {
    return this.prisma.exam.create({ data });
  }

  async findById(id: string): Promise<Exam | null> {
    return this.prisma.exam.findUnique({
      where: { id },
    });
  }

  async findAll(teacherId?: string, classId?: string, period?: string): Promise<Exam[]> {
    const where: Prisma.ExamWhereInput = {};
    if (classId) {
      where.classId = classId;
    } else if (teacherId) {
      where.class = {
        teacherId: teacherId,
      };
    }

    if (period && period !== 'all') {
      const now = new Date();
      let startDate = new Date();
      if (period === '1m') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === '3m') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (period === '6m') {
        startDate.setMonth(now.getMonth() - 6);
      }
      where.examDate = { gte: startDate };
    }

    return this.prisma.exam.findMany({
      where,
      include: {
        class: {
          include: {
            enrollments: true,
          },
        },
        examResults: true,
      },
      orderBy: { examDate: 'desc' },
    });
  }

  async update(id: string, data: Prisma.ExamUpdateInput): Promise<Exam> {
    return this.prisma.exam.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Exam> {
    // Delete exam results first (cascade)
    await this.prisma.examResult.deleteMany({
      where: { examId: id },
    });

    return this.prisma.exam.delete({
      where: { id },
    });
  }
}
