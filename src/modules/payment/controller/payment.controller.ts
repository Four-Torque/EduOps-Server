import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../service/payment.service';
import { CreatePaymentRequest } from '../request/create-payment.request';
import { UpdatePaymentRequest } from '../request/update-payment.request';
import { PaymentResponse } from '../response/payment.response';
import { PaginatedPaymentResponse } from '../response/paginated-payment.response';
import { PaymentType } from '@prisma/client';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  Message,
  ResponseMessage,
} from 'src/global';
import { ErrorCode } from 'src/global';

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
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'classId', required: false })
  @ApiQuery({ name: 'paymentType', enum: PaymentType, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('/')
  async findAll(
    @Query('studentId') studentId?: string,
    @Query('classId') classId?: string,
    @Query('paymentType') paymentType?: PaymentType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedPaymentResponse> {
    const response = await this.paymentService.findAll(
      studentId,
      classId,
      paymentType,
      page,
      limit,
    );
    return response;
  }

  @ApiOperation({
    summary: '결제 상세 조회',
    description: '결제 내역을 상세 조회합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.PAYMENT_FETCHED, PaymentResponse)
  @ApiErrorResponse(ErrorCode.PAYMENT_NOT_FOUND)
  @Message(ResponseMessage.PAYMENT_FETCHED)
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<PaymentResponse> {
    const response = await this.paymentService.findById(id);
    return response;
  }

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
