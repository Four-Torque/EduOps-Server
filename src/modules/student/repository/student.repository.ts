import { Injectable } from '@nestjs/common';
import { Prisma, Student, StudentStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findList(
    status: StudentStatus,
    name: string,
    skip: number,
    take: number,
  ): Promise<Student[]> {
    return this.prisma.student.findMany({
      where: {
        ...(status && { status }),
        ...(name && { name: { contains: name } }),
      },
      skip,
      take,
    });
  }

  countList(status: StudentStatus, name: string): Promise<number> {
    return this.prisma.student.count({
      where: {
        ...(status && { status }),
        ...(name && { name: { contains: name } }),
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
    return this.prisma.student.delete({
      where: { id },
    });
  }
}
