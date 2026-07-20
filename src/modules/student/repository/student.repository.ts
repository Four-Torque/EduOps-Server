import { Injectable } from '@nestjs/common';
import { Prisma, Student, StudentStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findList(
    status: StudentStatus,
    name: string,
    phone: string,
    skip: number,
    take: number,
  ): Promise<Student[]> {
    return this.prisma.student.findMany({
      where: {
        ...(status && {
          status: status === 'SUSPENDED' ? { in: ['SUSPENDED', 'EXPELLED'] } : status,
        }),
        ...(name && { name: { contains: name } }),
        ...(phone && { phone : {contains: phone}}),
      },
      skip,
      take,
    });
  }

  countList(status: StudentStatus, name: string, phone?: string): Promise<number> {
    return this.prisma.student.count({
      where: {
        ...(status && {
          status: status === 'SUSPENDED' ? { in: ['SUSPENDED', 'EXPELLED'] } : status,
        }),
        ...(name && { name: { contains: name } }),
        ...(phone && { phone: { contains: phone } }),
      },
    });
  }

  findById(id: string): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: {
        id,
      },
    });
  }

  create(data: Prisma.StudentCreateInput): Promise<Student> {
    return this.prisma.student.create({ data });
  }

  update(id: string, data: Prisma.StudentUpdateInput): Promise<Student> {
    return this.prisma.student.update({
      where: { id },
      data,
    });
  }

  delete(id: string): Promise<Student> {
    return this.prisma.student.update({
      where: { id },
      data: { status: 'EXPELLED' },
    });
  }

  async getStats() {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const studentsLastYear = await this.prisma.student.count({
      where: {
        createdAt: { lt: oneYearAgo },
      },
    });

    const totalStudents = await this.prisma.student.count();
    const totalStudentsGrowthRate = studentsLastYear > 0
      ? Math.round(((totalStudents - studentsLastYear) / studentsLastYear) * 100)
      : (totalStudents > 0 ? 100 : 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newRegistrations = await this.prisma.student.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    });

    const waitingConsultations = await this.prisma.student.count({
      where: {
        status: 'SUSPENDED',
      },
    });

    return {
      totalStudents,
      totalStudentsGrowthRate,
      newRegistrations,
      waitingConsultations,
    };
  }
}
