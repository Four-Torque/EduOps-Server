import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repository/payment.repository';
import { CreatePaymentRequest } from '../request/create-payment.request';
import { UpdatePaymentRequest } from '../request/update-payment.request';
import { PaymentResponse } from '../response/payment.response';
import { PaymentType, Prisma } from '@prisma/client';
import { ApiException, ErrorCode } from 'src/global';

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
    // 생성 후 다시 조회하여 연관 관계(student, class)를 가져옴
    const payment = await this.paymentRepository.findById(created.id);
    return PaymentResponse.fromEntity(payment);
  }

  /**
   * findById 메서드는 아이디로 결제 정보를 조회합니다.
   * @param id
   * @returns
   */
  async findById(id: string): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new ApiException(ErrorCode.PAYMENT_NOT_FOUND); // 에러 코드 조정 필요 시 수정
    }
    return PaymentResponse.fromEntity(payment);
  }

  /**
   * findAll 메서드는 필터 쿼리로 데이터 리스트를 조회합니다.
   * @param studentId
   * @param classId
   * @param paymentType
   * @param page
   * @param limit
   * @returns
   */
  async findAll(
    studentId?: string,
    classId?: string,
    paymentType?: PaymentType,
    search?: string,
    type?: 'all' | 'INCOME' | 'EXPENSE',
    page?: number,
    limit?: number,
  ): Promise<any> {
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit ? Number(limit) : undefined;

    const { data, total } = await this.paymentRepository.findAllUnified({
      studentId,
      classId,
      paymentType,
      type,
      search,
      skip,
      take,
    });

    return {
      page: page || 1,
      total,
      totalPages: limit ? Math.ceil(total / limit) : 1,
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

    // 상태가 PAID(완납)로 변경되거나 사용자가 날짜를 명시한 경우 paymentDate 처리
    if (request.paymentDate) {
      data.paymentDate = request.paymentDate;
    } else if (
      request.paymentType === PaymentType.PAID &&
      payment.paymentType !== PaymentType.PAID
    ) {
      // 기존에 PAID가 아니었는데 새로 PAID로 바뀌는 경우에만 오늘 날짜 자동 삽입
      data.paymentDate = new Date();
    } else if (request.paymentType === PaymentType.UNPAID) {
      data.paymentDate = null; // 미납으로 되돌릴 경우 결제일 삭제
    }

    await this.paymentRepository.update(id, data);

    const updated = await this.paymentRepository.findById(id);
    return PaymentResponse.fromEntity(updated);
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
    return this.paymentRepository.getStats();
  }

  async getMonthlyTrends() {
    return this.paymentRepository.getMonthlyTrends();
  }
}
