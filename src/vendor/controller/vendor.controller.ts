import { Body, Controller, Post } from '@nestjs/common';
import { VendorService } from '../service/vendor.service';
import { Role } from 'src/global/decorators/role.decorator';
import { CreateVendorRequest } from '../request/create-vendor.request';
import { VendorResponse } from '../response/vendor.response';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse, Message, ResponseMessage } from 'src/global';

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
}
