import { Injectable } from '@nestjs/common';
import { Prisma, ExamResult } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExamResultRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    examId: string,
    studentId: string,
    score: number,
  ): Promise<ExamResult> {
    const existing = await this.prisma.examResult.findFirst({
      where: { examId, studentId },
    });

    if (existing) {
      return this.prisma.examResult.update({
        where: { id: existing.id },
        data: { score },
      });
    }

    return this.prisma.examResult.create({
      data: {
        exam: { connect: { id: examId } },
        student: { connect: { id: studentId } },
        score,
      },
    });
  }

  async findByExamId(examId: string): Promise<ExamResult[]> {
    return this.prisma.examResult.findMany({
      where: { examId },
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: { name: true },
        },
      },
    });
  }

  async deleteByExamId(examId: string): Promise<number> {
    const result = await this.prisma.examResult.deleteMany({
      where: { examId },
    });
    return result.count;
  }
}
