import { Injectable } from '@nestjs/common';
import { Prisma, Payment } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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

  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return this.prisma.payment.update({ where: { id }, data });
  }

  async deleteUnpaidPayments(studentId: string, classId: string) {
    return this.prisma.payment.deleteMany({
      where: { studentId, classId, paymentType: 'UNPAID' },
    });
  }

  async findAllUnified(params: {
    studentId?: string;
    classId?: string;
    paymentType?: string;
    type?: 'all' | 'INCOME' | 'EXPENSE';
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const type = params.type || 'all';
    const search = params.search;
    const paymentType = params.paymentType;
    const skip = params.skip ?? 0;
    const take = params.take ?? 10;

    const promises: Promise<any>[] = [];

    if (type === 'all' || type === 'INCOME') {
      const paymentWhere = this.buildPaymentWhereInput({
        studentId: params.studentId,
        classId: params.classId,
        paymentType,
        search,
      });

      promises.push(
        this.prisma.payment
          .findMany({
            where: paymentWhere,
            include: { student: true, class: true },
            orderBy: { createdAt: 'desc' },
            ...(type === 'INCOME' && { skip, take }),
            ...(type === 'all' && { take: skip + take }),
          })
          .then((res) =>
            res.map((p) => ({
              id: p.id,
              type: 'INCOME',
              date: p.paymentDate ?? p.createdAt,
              dueDate: p.dueDate,
              itemTitle: p.title,
              itemSub: p.class?.name || '일반 청구',
              studentName: p.student?.name || '알 수 없음',
              amount: p.amount,
              status: p.paymentType,
            })),
          ),
      );
    } else {
      promises.push(Promise.resolve([]));
    }

    if (type === 'all' || type === 'EXPENSE') {
      const salaryWhere: Prisma.SalaryWhereInput = {
        ...(paymentType && {
          status: paymentType === 'PAID' ? 'COMPLETED' : 'PENDING',
        }),
        ...(search && {
          OR: [{ user: { name: { contains: search, mode: 'insensitive' } } }],
        }),
      };

      const assetWhere: Prisma.AssetsApplicationWhereInput = {
        status: paymentType
          ? paymentType === 'PAID'
            ? 'ACCEPTED'
            : 'PENDING'
          : { not: 'REJECTED' },
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      };

      const maxTake = type === 'all' ? skip + take : undefined;

      const salaryPromise = this.prisma.salary
        .findMany({
          where: salaryWhere,
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          ...(maxTake && { take: maxTake }),
        })
        .then((res) =>
          res.map((s) => ({
            id: s.id,
            type: 'EXPENSE',
            date: s.paymentDate ?? s.createdAt,
            itemTitle: `강사 급여 지급 (${s.user?.name || '강사'})`,
            itemSub: '급여',
            studentName: s.user?.name || '알 수 없음',
            amount: s.baseSalary + s.bonus,
            status: s.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
          })),
        );

      const assetPromise = this.prisma.assetsApplication
        .findMany({
          where: assetWhere,
          include: { user: true },
          orderBy: { requestedAt: 'desc' },
          ...(maxTake && { take: maxTake }),
        })
        .then((res) =>
          res.map((a) => ({
            id: a.id,
            type: 'EXPENSE',
            date: a.processedAt ?? a.requestedAt,
            itemTitle: `${a.name} 구매`,
            itemSub: '비품/자재',
            studentName: a.user?.name || '행정원',
            amount: a.price * a.quantity,
            status: a.status === 'ACCEPTED' ? 'COMPLETED' : 'PENDING',
          })),
        );

      promises.push(
        Promise.all([salaryPromise, assetPromise]).then(([s, a]) => [
          ...s,
          ...a,
        ]),
      );
    } else {
      promises.push(Promise.resolve([]));
    }

    const [incomes, expenses] = await Promise.all(promises);

    const combined = [...incomes, ...expenses];
    combined.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let total = 0;
    if (type === 'INCOME') {
      total = await this.count(
        params.studentId,
        params.classId,
        paymentType,
        search,
      );
    } else if (type === 'all') {
      total = combined.length;
    } else {
      total = combined.length;
    }

    const paginated =
      type === 'INCOME' ? combined : combined.slice(skip, skip + take);

    return { data: paginated, total };
  }

  async getStats() {
    const paymentGroups = await this.prisma.payment.groupBy({
      by: ['paymentType'],
      _sum: { amount: true },
      _count: { id: true },
    });

    let totalRevenue = 0,
      unpaidAmount = 0,
      unpaidCount = 0,
      refundAmount = 0,
      refundCount = 0;

    paymentGroups.forEach((g) => {
      const amount = g._sum.amount ?? 0;
      const count = g._count.id;
      if (g.paymentType === 'PAID') totalRevenue = amount;
      else if (g.paymentType === 'UNPAID') {
        unpaidAmount = amount;
        unpaidCount = count;
      } else if (g.paymentType === 'REFUNDED') {
        refundAmount = amount;
        refundCount = count;
      }
    });

    const [salaryAgg, assetApplications] = await Promise.all([
      this.prisma.salary.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { baseSalary: true, bonus: true },
      }),
      this.prisma.assetsApplication.findMany({
        where: { status: 'ACCEPTED' },
        select: { price: true, quantity: true },
      }),
    ]);

    const salaryExpense =
      (salaryAgg._sum.baseSalary ?? 0) + (salaryAgg._sum.bonus ?? 0);
    const assetExpense = assetApplications.reduce(
      (sum, a) => sum + a.price * a.quantity,
      0,
    );

    const totalExpense = salaryExpense + assetExpense;

    return {
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
      unpaidAmount,
      unpaidCount,
      refundCount,
      refundAmount,
    };
  }

  async getMonthlyTrends() {
    const now = new Date();
    const firstMonthDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const preFirstMonthDate = new Date(
      now.getFullYear(),
      now.getMonth() - 6,
      1,
    );

    const payments = await this.prisma.payment.findMany({
      where: {
        paymentType: 'PAID',
        OR: [
          { paymentDate: { gte: preFirstMonthDate } },
          { createdAt: { gte: preFirstMonthDate } },
        ],
      },
      select: { amount: true, paymentDate: true, createdAt: true },
    });

    const getMonthKey = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const monthKeys: string[] = [];
    const trendsMap = new Map<string, { current: number; previous: number }>();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = getMonthKey(d);
      monthKeys.push(mStr);
      trendsMap.set(mStr, { current: 0, previous: 0 });
    }

    const preFirstMonthKey = getMonthKey(preFirstMonthDate);
    const monthlyRevenue: Record<string, number> = {
      [preFirstMonthKey]: 0,
      ...Object.fromEntries(monthKeys.map((key) => [key, 0])),
    };

    payments.forEach((p) => {
      const date = new Date(p.paymentDate ?? p.createdAt);
      const key = getMonthKey(date);
      if (key in monthlyRevenue) {
        monthlyRevenue[key] += p.amount;
      }
    });

    monthKeys.forEach((key, idx) => {
      const currentRev = monthlyRevenue[key];
      const prevKey = idx === 0 ? preFirstMonthKey : monthKeys[idx - 1];
      const prevRev = monthlyRevenue[prevKey];

      trendsMap.set(key, { current: currentRev, previous: prevRev });
    });

    return Array.from(trendsMap.entries()).map(([key, value]) => ({
      month: `${parseInt(key.split('-')[1])}월`,
      current: value.current,
      previous: value.previous,
    }));
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
}
