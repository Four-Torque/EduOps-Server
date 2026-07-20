import { Injectable } from '@nestjs/common';
import { Prisma, Enrollment } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.EnrollmentCreateInput): Promise<Enrollment> {
    return this.prisma.enrollment.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: true,
        class: true,
      },
    });
  }

  async findAll(studentId?: string, classId?: string) {
    const where: Prisma.EnrollmentWhereInput = {
      ...(studentId && { studentId }),
      ...(classId && { classId }),
    };

    return this.prisma.enrollment.findMany({
      where,
      include: {
        student: true,
        class: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByStudentAndClass(studentId: string, classId: string) {
    return this.prisma.enrollment.findFirst({
      where: {
        studentId,
        classId,
      },
    });
  }

  async delete(id: string): Promise<Enrollment> {
    return this.prisma.enrollment.delete({
      where: { id },
    });
  }

  async findSchedulesByStudentId(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        class: {
          include: {
            schedules: true,
          },
        },
      },
    });

    return enrollments.flatMap((enrollment) => enrollment.class.schedules);
  }
}
