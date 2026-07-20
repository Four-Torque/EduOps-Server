import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../service/payment.service';
import { CreatePaymentRequest } from '../request/create-payment.request';
import { UpdatePaymentRequest } from '../request/update-payment.request';
import { PaymentResponse } from '../response/payment.response';
import { PaginatedPaymentResponse } from '../response/paginated-payment.response';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  Message,
  ResponseMessage,
} from 'src/global';
import { ErrorCode } from 'src/global';
import { PaymentFilterRequest } from '../request/payment-filter.request';

@ApiTags('결제')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({
    summary: '결제/청구 내역 수동 생성',
    description: '수동으로 결제 청구서를 생성합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.PAYMENT_CREATED, PaymentResponse)
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.PAYMENT_CREATED)
  @Post('/')
  async create(
    @Body() request: CreatePaymentRequest,
  ): Promise<PaymentResponse> {
    const response = await this.paymentService.create(request);
    return response;
  }

  @ApiOperation({
    summary: '결제 내역 목록 조회',
    description: '전체 결제 내역을 조회합니다. 필터링 및 페이징이 가능합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.PAYMENT_FETCHED, PaginatedPaymentResponse)
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.PAYMENT_FETCHED)
  @Get('/')
  async findAll(@Query() request: PaymentFilterRequest) {
    const response = await this.paymentService.findAll(request);
    return response;
  }

  // 원생 결제 관리 목록(findAll)만 쓰는 걸로 정리하면서 주석 처리.
  // (getMonthlyTrends는 서비스에 대응 메서드가 이미 없어 컴파일 에러 상태였음)
  // @ApiOperation({
  //   summary: '결제 통계 조회',
  //   description: '결제 매출 및 지출 통계를 조회합니다.',
  // })
  // @Get('/stats')
  // async getStats() {
  //   const response = await this.paymentService.getStats();
  //   return response;
  // }

  // @ApiOperation({
  //   summary: '월별 수입/지출 추이 조회',
  //   description: '최근 6개월 간의 월별 수입 및 지출 추이를 조회합니다.',
  // })
  // @Get('/monthly-trends')
  // async getMonthlyTrends() {
  //   const response = await this.paymentService.getMonthlyTrends();
  //   return response;
  // }

  // @ApiOperation({
  //   summary: '결제 상세 조회',
  //   description: '결제 내역을 상세 조회합니다.',
  // })
  // @ApiSuccessResponse(ResponseMessage.PAYMENT_FETCHED, PaymentResponse)
  // @ApiErrorResponse(ErrorCode.PAYMENT_NOT_FOUND)
  // @Message(ResponseMessage.PAYMENT_FETCHED)
  // @Get('/:id')
  // async findById(@Param('id') id: string): Promise<PaymentResponse> {
  //   const response = await this.paymentService.findById(id);
  //   return response;
  // }

  @ApiOperation({
    summary: '결제 상태 및 정보 변경',
    description:
      '미납, 완납 등의 상태를 변경하거나 청구 금액/기한을 수정합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.PAYMENT_UPDATED, PaymentResponse)
  @ApiErrorResponse(ErrorCode.PAYMENT_NOT_FOUND)
  @Message(ResponseMessage.PAYMENT_UPDATED)
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() request: UpdatePaymentRequest,
  ): Promise<PaymentResponse> {
    const response = await this.paymentService.update(id, request);
    return response;
  }
}
