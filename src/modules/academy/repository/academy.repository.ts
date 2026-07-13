import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AcademyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getInfo() {
    let info = await this.prisma.academyInfo.findFirst();
    if (!info) {
      info = await this.prisma.academyInfo.create({
        data: {
          academyName: 'KOSTA 가산교육센터',
          representativeName: '이민하',
          representativePhone: '053-323-5225',
          businessNumber: 'ACA-2023-9981',
          address: '서울특별시 구로구 디지털로 20길 10 스테이린 203호',
        },
      });
    }
    return info;
  }

  async updateInfo(data: Prisma.AcademyInfoUpdateInput) {
    const info = await this.getInfo();
    return this.prisma.academyInfo.update({
      where: { id: info.id },
      data,
    });
  }

  async getOverview() {
    const totalStudents = await this.prisma.student.count();
    const totalEnrolled = await this.prisma.user.count();
    const enrolledStudents = await this.prisma.student.count({
      where: { status: 'ENROLLED' },
    });
    const usageRate =
      totalStudents > 0
        ? Math.round((enrolledStudents / totalStudents) * 100)
        : 0;

    return {
      totalStudents,
      totalEnrolled,
      usageRate,
    };
  }
}
