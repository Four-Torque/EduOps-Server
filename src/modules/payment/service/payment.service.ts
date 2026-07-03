import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repository/payment.repository';
import { CreatePaymentRequest } from '../request/create-payment.request';
import { UpdatePaymentRequest } from '../request/update-payment.request';
import { PaymentResponse } from '../response/payment.response';
import { PaginatedPaymentResponse } from '../response/paginated-payment.response';
import { PaymentType, Prisma } from '@prisma/client';
import { ApiException, ErrorCode } from 'src/global';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async create(request: CreatePaymentRequest): Promise<PaymentResponse> {
    const data = CreatePaymentRequest.toEntity(request);
    const created = await this.paymentRepository.create(data);
    // 생성 후 다시 조회하여 연관 관계(student, class)를 가져옴
    const payment = await this.paymentRepository.findById(created.id);
    return PaymentResponse.fromEntity(payment);
  }

  async findById(id: string): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new ApiException(ErrorCode.PAYMENT_NOT_FOUND); // 에러 코드 조정 필요 시 수정
    }
    return PaymentResponse.fromEntity(payment);
  }

  async findAll(
    studentId?: string,
    classId?: string,
    paymentType?: PaymentType,
    page?: number,
    limit?: number,
  ): Promise<PaginatedPaymentResponse> {
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit ? Number(limit) : undefined;

    const [data, total] = await Promise.all([
      this.paymentRepository.findAll(
        studentId,
        classId,
        paymentType,
        skip,
        take,
      ),
      this.paymentRepository.count(studentId, classId, paymentType),
    ]);

    const mappedData = data.map((payment) =>
      PaymentResponse.fromEntity(payment as any),
    );

    return {
      page: page || 1,
      total,
      data: mappedData,
    };
  }

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
    } else if (request.paymentType === PaymentType.PAID && payment.paymentType !== PaymentType.PAID) {
      // 기존에 PAID가 아니었는데 새로 PAID로 바뀌는 경우에만 오늘 날짜 자동 삽입
      data.paymentDate = new Date();
    } else if (request.paymentType === PaymentType.UNPAID) {
      data.paymentDate = null; // 미납으로 되돌릴 경우 결제일 삭제
    }

    await this.paymentRepository.update(id, data);

    const updated = await this.paymentRepository.findById(id);
    return PaymentResponse.fromEntity(updated);
  }

  async deleteUnpaidPayments(studentId: string, classId: string): Promise<void> {
    await this.paymentRepository.deleteUnpaidPayments(studentId, classId);
  }
}
