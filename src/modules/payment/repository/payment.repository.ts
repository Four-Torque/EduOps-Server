import { Injectable } from '@nestjs/common';
import { Prisma, Payment } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { toKstDateRange } from 'src/global';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({ data });
  }

  async findById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { student: true, class: true },
    });
  }

  async findAll(
    studentId?: string,
    classId?: string,
    paymentType?: any,
    search?: string,
    skip?: number,
    take?: number,
  ) {
    const where = this.buildPaymentWhereInput({
      studentId,
      classId,
      paymentType,
      search,
    });
    return this.prisma.payment.findMany({
      where,
      skip,
      take,
      include: { student: true, class: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  async count(
    studentId?: string,
    classId?: string,
    paymentType?: any,
    search?: string,
  ): Promise<number> {
    const where = this.buildPaymentWhereInput({
      studentId,
      classId,
      paymentType,
      search,
    });
    return this.prisma.payment.count({ where });
  }

  async findSalaries(salaryWhere: Prisma.SalaryWhereInput, maxTake: number) {
    return this.prisma.salary.findMany({
      where: salaryWhere,
      take: maxTake,
      include: {
        user: {
          select: { name: true },
        },
      },
    });
  }

  async findAssetsApplications(
    where: Prisma.AssetsApplicationWhereInput,
    take?: number,
  ) {
    return this.prisma.assetsApplication.findMany({
      where,
      take,
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return this.prisma.payment.update({ where: { id }, data });
  }

  async deleteUnpaidPayments(studentId: string, classId: string) {
    return this.prisma.payment.deleteMany({
      where: { studentId, classId, paymentType: 'UNPAID' },
    });
  }

  async aggregateStats() {
    return this.prisma.payment.groupBy({
      by: ['paymentType'],
      _sum: { amount: true },
      _count: { id: true },
    });
  }
  async aggregateSalary() {
    return this.prisma.salary.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { baseSalary: true, bonus: true },
    });
  }

  async findAcceptedAssets() {
    return this.prisma.assetsApplication.findMany({
      where: { status: 'ACCEPTED' },
      select: { price: true, quantity: true },
    });
  }

  async findRecentPaidPayments(fromDate: Date) {
    return this.prisma.payment.findMany({
      where: {
        paymentType: 'PAID',
        OR: [
          { paymentDate: { gte: fromDate } },
          { createdAt: { gte: fromDate } },
        ],
      },
      select: { amount: true, paymentDate: true, createdAt: true },
    });
  }

  /** PAID 결제를 paymentDate 기준 기간으로 집계 (합계·건수) */
  async aggregatePaidByPeriod(gte: Date, lt: Date) {
    return this.prisma.payment.aggregate({
      where: { paymentType: 'PAID', paymentDate: { gte, lt } },
      _sum: { amount: true },
      _count: { _all: true },
    });
  }

  /** UNPAID 건수를 dueDate 기준 기간으로 집계 */
  async countUnpaidByPeriod(gte: Date, lt: Date) {
    return this.prisma.payment.count({
      where: { paymentType: 'UNPAID', dueDate: { gte, lt } },
    });
  }

  /** 차트 버킷용 PAID 결제 목록 (paymentDate 기준 기간) */
  async findPaidByPeriod(gte: Date, lt: Date) {
    return this.prisma.payment.findMany({
      where: { paymentType: 'PAID', paymentDate: { gte, lt } },
      select: { amount: true, paymentDate: true },
    });
  }

  private buildPaymentWhereInput(params: {
    studentId?: string;
    classId?: string;
    paymentType?: any;
    search?: string;
  }): Prisma.PaymentWhereInput {
    return {
      ...(params.studentId && { studentId: params.studentId }),
      ...(params.classId && { classId: params.classId }),
      ...(params.paymentType && { paymentType: params.paymentType }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: 'insensitive' } },
          {
            student: { name: { contains: params.search, mode: 'insensitive' } },
          },
          { class: { name: { contains: params.search, mode: 'insensitive' } } },
        ],
      }),
    };
  }

  async getPaymentsByStartDateAndEndDate(startDate: string, endDate: string) {
    const { gte, lt } = toKstDateRange(startDate, endDate);
    return this.prisma.payment.findMany({
      where: {
        paymentType: {
          not: 'UNPAID',
        },
        paymentDate: { gte, lt },
      },
      include: { student: true, class: true },
    });
  }
}
