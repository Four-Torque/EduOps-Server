import { Injectable } from '@nestjs/common';
import { ClassSyllabus, Prisma, ClassStatus, SyllabusStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClassSyllabusRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ClassSyllabusUncheckedCreateInput): Promise<ClassSyllabus> {
    return this.prisma.classSyllabus.create({
      data,
    });
  }

  async findById(id: string): Promise<ClassSyllabus> {
    return this.prisma.classSyllabus.findUnique({
      where: { id },
      include: {
        teacher: {
          select: { name: true, email: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.ClassSyllabusUpdateInput): Promise<ClassSyllabus> {
    return this.prisma.classSyllabus.update({
      where: { id },
      data,
    });
  }

  async findAll(
    teacherId?: string,
    status?: SyllabusStatus,
    skip?: number,
    take?: number,
  ): Promise<ClassSyllabus[]> {
    const where: Prisma.ClassSyllabusWhereInput = {
      ...(teacherId && { teacherId }),
      ...(status && { status }),
    };

    return this.prisma.classSyllabus.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: {
          select: { name: true, email: true },
        },
      },
    });
  }

  async count(teacherId?: string, status?: SyllabusStatus): Promise<number> {
    const where: Prisma.ClassSyllabusWhereInput = {
      ...(teacherId && { teacherId }),
      ...(status && { status }),
    };

    return this.prisma.classSyllabus.count({
      where,
    });
  }

  async updateStatus(id: string, status: SyllabusStatus): Promise<ClassSyllabus> {
    return this.prisma.classSyllabus.update({
      where: { id },
      data: { status },
    });
  }

  async createClassFromSyllabus(syllabus: ClassSyllabus) {
    return this.prisma.class.create({
      data: {
        teacherId: syllabus.teacherId,
        name: syllabus.name,
        fee: syllabus.fee,
        capacity: syllabus.capacity,
        startDate: syllabus.startDate,
        endDate: syllabus.endDate,
        status: ClassStatus.OPEN,
      },
    });
  }
}
