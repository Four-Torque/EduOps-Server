import { Injectable } from '@nestjs/common';
import { Prisma, Payment } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        student: true,
        class: true,
      },
    });
  }

  async findAll(
    studentId?: string,
    classId?: string,
    paymentType?: any,
    skip?: number,
    take?: number,
  ) {
    const where: Prisma.PaymentWhereInput = {
      ...(studentId && { studentId }),
      ...(classId && { classId }),
      ...(paymentType && { paymentType }),
    };

    return this.prisma.payment.findMany({
      where,
      skip,
      take,
      include: {
        student: true,
        class: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async count(
    studentId?: string,
    classId?: string,
    paymentType?: any,
  ): Promise<number> {
    const where: Prisma.PaymentWhereInput = {
      ...(studentId && { studentId }),
      ...(classId && { classId }),
      ...(paymentType && { paymentType }),
    };

    return this.prisma.payment.count({
      where,
    });
  }

  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data,
    });
  }

  async deleteUnpaidPayments(studentId: string, classId: string) {
    return this.prisma.payment.deleteMany({
      where: {
        studentId,
        classId,
        paymentType: 'UNPAID', // PaymentType.UNPAID 상수 사용 가능 (하지만 prisma 타입 상 'UNPAID'로 매핑됨)
      },
    });
  }
}
