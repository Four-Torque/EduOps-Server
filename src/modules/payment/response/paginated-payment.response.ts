import { ApiProperty } from '@nestjs/swagger';
import { PaymentResponse } from './payment.response';

export class PaginatedPaymentResponse {
  @ApiProperty({
    description: '현재 페이지',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '전체 결제 내역 개수',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: '결제/청구 내역 목록',
    type: [PaymentResponse],
  })
  data: PaymentResponse[];
}
