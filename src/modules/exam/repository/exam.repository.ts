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

  async findByClassId(classId: string): Promise<Exam[]> {
    return this.prisma.exam.findMany({
      where: { classId },
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
