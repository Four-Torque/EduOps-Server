import { Injectable } from '@nestjs/common';
import { Prisma, StaffAttendance } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StaffAttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(
    userId: string,
    workDate?: string,
  ): Promise<StaffAttendance[]> {
    return this.prisma.staffAttendance.findMany({
      where: {
        userId,
        ...(workDate && { workDate: new Date(workDate) }),
      },
    });
  }

  async findById(id: string): Promise<StaffAttendance | null> {
    return this.prisma.staffAttendance.findUnique({
      where: { id },
    });
  }

  async createAttendance(
    data: Prisma.StaffAttendanceCreateInput,
  ): Promise<StaffAttendance> {
    return this.prisma.staffAttendance.create({
      data: data,
    });
  }

  async checkOut(id: string): Promise<StaffAttendance> {
    return this.prisma.staffAttendance.update({
      where: { id },
      data: { checkOutTime: new Date() },
    });
  }
}
