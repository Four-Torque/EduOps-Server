import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repository/payment.repository';
import { CreatePaymentRequest } from '../request/create-payment.request';
import { UpdatePaymentRequest } from '../request/update-payment.request';
import { PaymentResponse } from '../response/payment.response';
import { PaymentType, Prisma } from '@prisma/client';
import { ApiException, ErrorCode } from 'src/global';
import { PaymentFilterRequest } from '../request/payment-filter.request';

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

  // 원생 결제 관리 목록(findAll)만 쓰는 걸로 정리하면서 주석 처리.
  // 실제로 부르는 프론트/다른 서버 코드가 없어 안전하게 비활성화함.
  // /**
  //  * findById 메서드는 아이디로 결제 정보를 조회합니다.
  //  * @param id
  //  * @returns
  //  */
  // async findById(id: string): Promise<PaymentResponse> {
  //   const payment = await this.paymentRepository.findById(id);
  //   if (!payment) {
  //     throw new ApiException(ErrorCode.PAYMENT_NOT_FOUND);
  //   }
  //   const response = PaymentResponse.fromEntity(payment);
  //   return response;
  // }

  /**
   * findAll 메서드는 원생 결제 목록을 조회합니다.
   * (급여/자재 등 지출 항목을 섞어 보여주던 통합 조회 로직은 원생 결제 관리 범위 밖이라 제거함)
   * @param request
   * @returns
   */
  async findAll(request: PaymentFilterRequest) {
    const { studentId, classId, paymentType, search, page = 1, limit = 10 } =
      request;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

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

    const data = dbPayments.map((payment) => PaymentResponse.fromEntity(payment));

    return {
      page: Number(page),
      total,
      totalPages: Math.ceil(total / take) || 1,
      data,
    };
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

  // async getStats() {
  //   const [paymentGroups, salaryAgg, assets] = await Promise.all([
  //     this.paymentRepository.aggregateStats(),
  //     this.paymentRepository.aggregateSalary(),
  //     this.paymentRepository.findAcceptedAssets(),
  //   ]);
  //
  //   let totalRevenue = 0;
  //   let unpaidAmount = 0;
  //   let unpaidCount = 0;
  //   let refundAmount = 0;
  //   let refundCount = 0;
  //
  //   paymentGroups.forEach((group) => {
  //     const amount = group._sum.amount ?? 0;
  //     const count = group._count.id;
  //
  //     if (group.paymentType === 'PAID') {
  //       totalRevenue = amount;
  //     } else if (group.paymentType === 'UNPAID') {
  //       unpaidAmount = amount;
  //       unpaidCount = count;
  //     } else if (group.paymentType === 'REFUNDED') {
  //       refundAmount = amount;
  //       refundCount = count;
  //     }
  //   });
  //
  //   const salaryExpense =
  //     (salaryAgg._sum.baseSalary ?? 0) + (salaryAgg._sum.bonus ?? 0);
  //   const assetExpense = assets.reduce(
  //     (sum, asset) => sum + asset.price * asset.quantity,
  //     0,
  //   );
  //   const totalExpense = salaryExpense + assetExpense;
  //
  //   return {
  //     totalRevenue,
  //     totalExpense,
  //     netProfit: totalRevenue - totalExpense,
  //     unpaidAmount,
  //     unpaidCount,
  //     refundCount,
  //     refundAmount,
  //   };
  // }

  // findAll이 급여/자재 지출 조회를 더 이상 안 해서 같이 주석 처리.
  // private buildSalaryWhere(
  //   paymentType?: string,
  //   search?: string,
  // ): Prisma.SalaryWhereInput {
  //   const statusCondition = paymentType
  //     ? paymentType === 'PAID'
  //       ? 'COMPLETED'
  //       : paymentType === 'UNPAID'
  //         ? 'PENDING'
  //         : undefined
  //     : undefined;
  //
  //   return {
  //     ...(statusCondition !== undefined && { status: statusCondition }),
  //     ...(search && {
  //       OR: [{ user: { name: { contains: search, mode: 'insensitive' } } }],
  //     }),
  //   };
  // }
  //
  // private buildAssetWhere(
  //   paymentType?: string,
  //   search?: string,
  // ): Prisma.AssetsApplicationWhereInput {
  //   let statusCondition: any;
  //   if (!paymentType) {
  //     statusCondition = { not: 'REJECTED' };
  //   } else if (paymentType === 'PAID') {
  //     statusCondition = 'ACCEPTED';
  //   } else if (paymentType === 'UNPAID') {
  //     statusCondition = 'PENDING';
  //   } else {
  //     statusCondition = { not: 'REJECTED' };
  //   }
  //
  //   return {
  //     status: statusCondition,
  //     ...(search && {
  //       OR: [
  //         { name: { contains: search, mode: 'insensitive' } },
  //         { user: { name: { contains: search, mode: 'insensitive' } } },
  //       ],
  //     }),
  //   };
  // }
}
