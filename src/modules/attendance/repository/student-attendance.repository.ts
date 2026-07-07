import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Prisma,
  Student,
  StudentAttendance,
  StudentAttendanceStatus,
} from '@prisma/client';

@Injectable()
export class StudentAttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<StudentAttendance | null> {
    return this.prisma.studentAttendance.findUnique({
      where: {
        id,
      },
    });
  }

  findByStudentId(
    studentId: string,
    lectureDate?: string,
  ): Promise<StudentAttendance[]> {
    return this.prisma.studentAttendance.findMany({
      where: {
        studentId,
        ...(lectureDate && { lectureDate }),
      },
    });
  }

  create(
    data: Prisma.StudentAttendanceCreateInput,
  ): Promise<StudentAttendance> {
    return this.prisma.studentAttendance.create({
      data: data,
    });
  }

  update(
    id: string,
    status: StudentAttendanceStatus,
  ): Promise<StudentAttendance> {
    return this.prisma.studentAttendance.update({
      where: { id },
      data: { status },
    });
  }

  findList(
    studentId?: string,
    classId?: string,
    lectureDate?: string,
  ): Promise<StudentAttendance[]> {
    return this.prisma.studentAttendance.findMany({
      where: {
        ...(studentId && { studentId }),
        ...(classId && { classId }),
        ...(lectureDate && { lectureDate }),
      },
    });
  }
}
