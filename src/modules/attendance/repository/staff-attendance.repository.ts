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
        ...(workDate && { workDate }),
      },
    });
  }

  async findById(id: string): Promise<StaffAttendance | null> {
    return this.prisma.staffAttendance.findUnique({
      where: { id },
    });
  }

  async create(
    data: Prisma.StaffAttendanceCreateInput,
  ): Promise<StaffAttendance> {
    return this.prisma.staffAttendance.create({
      data: data,
    });
  }

  async checkOut(
    id: string,
    checkOutTime: Date = new Date(),
  ): Promise<StaffAttendance> {
    return this.prisma.staffAttendance.update({
      where: { id },
      data: { checkOutTime },
    });
  }

  async findLatestUncheckedOut(
    userId: string,
  ): Promise<StaffAttendance | null> {
    return this.prisma.staffAttendance.findFirst({
      where: {
        userId,
        checkOutTime: null,
      },
      orderBy: {
        workDate: 'desc',
      },
    });
  }

  async update(
    id: string,
    data: Prisma.StaffAttendanceUpdateInput,
  ): Promise<StaffAttendance> {
    return this.prisma.staffAttendance.update({
      where: { id },
      data,
    });
  }

  async findWeeklyAttendance(
    department?: string,
    search?: string,
    dates?: string[],
    skip?: number,
    limit?: number,
  ) {
    const roleFilter: any = {};
    if (department === '강사') {
      roleFilter.role = 'TEACHER';
    } else if (department === '관리자') {
      roleFilter.role = { in: ['MANAGER', 'DIRECTOR'] };
    }

    console.log('skip', skip, 'limit', limit);

    const users = await this.prisma.user.findMany({
      where: {
        ...roleFilter,
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
      },
      skip,
      take: limit,
    });

    const attendances = await this.prisma.staffAttendance.findMany({
      where: {
        userId: { in: users.map((u) => u.id) },
        ...(dates && { workDate: { in: dates } }),
      },
    });

    return { users, attendances };
  }

  async userCount(department?: string, search?: string) {
    return this.prisma.user.count({
      where: {
        ...(department === '강사' && { role: 'TEACHER' }),
        ...(department === '관리자' && {
          role: { in: ['MANAGER', 'DIRECTOR'] },
        }),
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
      },
    });
  }
}
