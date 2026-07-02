import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { VendorService } from '../service/vendor.service';
import { Role } from 'src/global/decorators/role.decorator';
import { CreateVendorRequest } from '../request/create-vendor.request';
import { VendorResponse } from '../response/vendor.response';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  Message,
  ResponseMessage,
} from 'src/global';
import { PaginatedVendorRequest } from '../request/paginated-vendor.request';
import { PaginatedVendorResponse } from '../response/paignated-vendor.response';
import { UpdateVendorRequest } from '../request/update-vendor.request';

@Role('DIRECTOR', 'MANAGER')
@ApiTags('구매처')
@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @ApiOperation({
    summary: '구매처 생성',
    description: '구매처를 생성합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.VENDOR_CREATED, VendorResponse)
  @Message(ResponseMessage.VENDOR_CREATED)
  @Post()
  async create(@Body() request: CreateVendorRequest): Promise<VendorResponse> {
    const response = await this.vendorService.create(request);
    return response;
  }

  @ApiOperation({
    summary: '구매처 목록 조회',
    description: '구매처 목록을 조회합니다.',
  })
  @ApiSuccessResponse(null, PaginatedVendorResponse)
  @Get()
  async findAll(
    @Query() request: PaginatedVendorRequest,
  ): Promise<PaginatedVendorResponse> {
    const response = await this.vendorService.findAll(request);
    return response;
  }

  @Get(':id')
  @ApiOperation({
    summary: '구매처 상세 조회',
    description: '구매처 상세 정보를 조회합니다.',
  })
  @ApiSuccessResponse(null, VendorResponse)
  @ApiErrorResponse(ErrorCode.VENDOR_NOT_FOUND)
  async findById(@Param('id') id: string): Promise<VendorResponse> {
    const response = await this.vendorService.findById(id);
    return response;
  }

  @Put(':id')
  @ApiOperation({
    summary: '구매처 수정',
    description: '구매처 정보를 수정합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.VENDOR_UPDATED, VendorResponse)
  @ApiErrorResponse(ErrorCode.VENDOR_NOT_FOUND)
  @Message(ResponseMessage.VENDOR_UPDATED)
  async update(
    @Param('id') id: string,
    @Body() request: UpdateVendorRequest,
  ): Promise<VendorResponse> {
    const response = await this.vendorService.update(id, request);
    return response;
  }
}
