import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repository/payment.repository';
import { CreatePaymentRequest } from '../request/create-payment.request';
import { UpdatePaymentRequest } from '../request/update-payment.request';
import { PaymentResponse } from '../response/payment.response';
import { PaymentType, Prisma } from '@prisma/client';
import { ApiException, ErrorCode } from 'src/global';
import { PaymentFilterRequest } from '../request/payment-filter.request';
import { UnifiedFinancialResponse } from '../response/unified-financial.response';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  /**
   * create 메서드는 결제 정보를 생성합니다.
   * @param request
   * @returns
   */
  async create(request: CreatePaymentRequest): Promise<PaymentResponse> {
    const data = CreatePaymentRequest.toEntity(request);
    const created = await this.paymentRepository.create(data);
    const payment = await this.paymentRepository.findById(created.id);
    const response = PaymentResponse.fromEntity(payment);
    return response;
  }

  /**
   * findById 메서드는 아이디로 결제 정보를 조회합니다.
   * @param id
   * @returns
   */
  async findById(id: string): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new ApiException(ErrorCode.PAYMENT_NOT_FOUND);
    }
    const response = PaymentResponse.fromEntity(payment);
    return response;
  }

  /**
   * findAll 메서드는 필터 쿼리로 데이터 리스트를 조회합니다.
   * @param request
   * @returns
   */
  async findAll(request: PaymentFilterRequest) {
    const {
      studentId,
      classId,
      paymentType,
      search,
      type = 'all',
      page = 1,
      limit = 10,
    } = request;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    if (type === 'INCOME') {
      const [dbPayments, total] = await Promise.all([
        this.paymentRepository.findAll(
          studentId,
          classId,
          paymentType,
          search,
          skip,
          take,
        ),
        this.paymentRepository.count(studentId, classId, paymentType, search),
      ]);

      const data = dbPayments.map((payment) =>
        UnifiedFinancialResponse.fromPaymentEntity(payment),
      );
      const response = UnifiedFinancialResponse.toPaginated(
        page,
        total,
        Math.ceil(total / take),
        data,
      );
      return response;
    }

    const maxTake = type === 'all' ? skip + take : take;
    const incomes = [];
    const expenses = [];

    if (type === 'all') {
      const dbPayments = await this.paymentRepository.findAll(
        studentId,
        classId,
        paymentType,
        search,
        undefined,
        maxTake,
      );
      const mappedIncomes = dbPayments.map((payment) =>
        UnifiedFinancialResponse.fromPaymentEntity(payment),
      );
      incomes.push(...mappedIncomes);
    }

    if (type === 'all' || type === 'EXPENSE') {
      const salaryWhere = this.buildSalaryWhere(paymentType, search);
      const assetWhere = this.buildAssetWhere(paymentType, search);

      const includeExpenseSources =
        !paymentType || paymentType === 'PAID' || paymentType === 'UNPAID';

      let dbSalaries = [];
      let dbAssetsApplications = [];

      if (includeExpenseSources) {
        [dbSalaries, dbAssetsApplications] = await Promise.all([
          this.paymentRepository.findSalaries(salaryWhere, maxTake),
          this.paymentRepository.findAssetsApplications(assetWhere, maxTake),
        ]);

        const mappedSalaries = dbSalaries.map((salary) =>
          UnifiedFinancialResponse.fromSalaryEntity(salary),
        );
        const mappedAssetsApplications = dbAssetsApplications.map(
          (assetsApplication) =>
            UnifiedFinancialResponse.fromAssetEntity(assetsApplication),
        );

        expenses.push(...mappedSalaries, ...mappedAssetsApplications);
      }
    }

    const combined = [...incomes, ...expenses];
    combined.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const total = combined.length;
    const data = combined.slice(skip, skip + take);

    const response = UnifiedFinancialResponse.toPaginated(
      page,
      total,
      Math.ceil(total / take) || 1,
      data,
    );
    return response;
  }

  /**
   * update 메서드는 결제 정보를 업데이트합니다.
   * @param id
   * @param request
   * @returns
   */
  async update(
    id: string,
    request: UpdatePaymentRequest,
  ): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new ApiException(ErrorCode.PAYMENT_NOT_FOUND);
    }

    const data: Prisma.PaymentUpdateInput = {
      ...(request.paymentType && { paymentType: request.paymentType }),
      ...(request.title !== undefined && { title: request.title }),
      ...(request.amount !== undefined && { amount: request.amount }),
      ...(request.dueDate && { dueDate: request.dueDate }),
    };

    if (request.paymentDate) {
      data.paymentDate = request.paymentDate;
    } else if (
      request.paymentType === PaymentType.PAID &&
      payment.paymentType !== PaymentType.PAID
    ) {
      data.paymentDate = new Date();
    } else if (request.paymentType === PaymentType.UNPAID) {
      data.paymentDate = null;
    }

    await this.paymentRepository.update(id, data);

    const updated = await this.paymentRepository.findById(id);
    const response = PaymentResponse.fromEntity(updated);
    return response;
  }

  /**
   * deleteUnpaidPayments 메서드는 납부되지 않은 결제 컬럼은 삭제합니다.
   * @param studentId
   * @param classId
   */
  async deleteUnpaidPayments(
    studentId: string,
    classId: string,
  ): Promise<void> {
    await this.paymentRepository.deleteUnpaidPayments(studentId, classId);
  }

  async getStats() {
    const [paymentGroups, salaryAgg, assets] = await Promise.all([
      this.paymentRepository.aggregateStats(),
      this.paymentRepository.aggregateSalary(),
      this.paymentRepository.findAcceptedAssets(),
    ]);

    let totalRevenue = 0;
    let unpaidAmount = 0;
    let unpaidCount = 0;
    let refundAmount = 0;
    let refundCount = 0;

    paymentGroups.forEach((group) => {
      const amount = group._sum.amount ?? 0;
      const count = group._count.id;

      if (group.paymentType === 'PAID') {
        totalRevenue = amount;
      } else if (group.paymentType === 'UNPAID') {
        unpaidAmount = amount;
        unpaidCount = count;
      } else if (group.paymentType === 'REFUNDED') {
        refundAmount = amount;
        refundCount = count;
      }
    });

    const salaryExpense =
      (salaryAgg._sum.baseSalary ?? 0) + (salaryAgg._sum.bonus ?? 0);
    const assetExpense = assets.reduce(
      (sum, asset) => sum + asset.price * asset.quantity,
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
    const preFirstMonthDate = new Date(
      now.getFullYear(),
      now.getMonth() - 6,
      1,
    );
    const payments =
      await this.paymentRepository.findRecentPaidPayments(preFirstMonthDate);

    const getMonthKey = (date: Date) =>
      `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const monthKeys = Array.from({ length: 6 }, (_, i) =>
      getMonthKey(new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)),
    );

    const preFirstMonthKey = getMonthKey(preFirstMonthDate);
    const monthlyRevenue: Record<string, number> = {
      [preFirstMonthKey]: 0,
      ...Object.fromEntries(monthKeys.map((key) => [key, 0])),
    };

    payments.forEach((payment) => {
      const key = getMonthKey(
        new Date(payment.paymentDate ?? payment.createdAt),
      );
      if (key in monthlyRevenue) {
        monthlyRevenue[key] += payment.amount;
      }
    });

    const response = monthKeys.map((key, idx) => {
      const prevKey = idx === 0 ? preFirstMonthKey : monthKeys[idx - 1];
      return {
        month: `${parseInt(key.split('-')[1])}월`,
        current: monthlyRevenue[key],
        previous: monthlyRevenue[prevKey],
      };
    });

    return response;
  }

  private buildSalaryWhere(
    paymentType?: string,
    search?: string,
  ): Prisma.SalaryWhereInput {
    const statusCondition = paymentType
      ? paymentType === 'PAID'
        ? 'COMPLETED'
        : paymentType === 'UNPAID'
          ? 'PENDING'
          : undefined
      : undefined;

    return {
      ...(statusCondition !== undefined && { status: statusCondition }),
      ...(search && {
        OR: [{ user: { name: { contains: search, mode: 'insensitive' } } }],
      }),
    };
  }

  private buildAssetWhere(
    paymentType?: string,
    search?: string,
  ): Prisma.AssetsApplicationWhereInput {
    let statusCondition: any;
    if (!paymentType) {
      statusCondition = { not: 'REJECTED' };
    } else if (paymentType === 'PAID') {
      statusCondition = 'ACCEPTED';
    } else if (paymentType === 'UNPAID') {
      statusCondition = 'PENDING';
    } else {
      statusCondition = { not: 'REJECTED' };
    }

    return {
      status: statusCondition,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };
  }
}
