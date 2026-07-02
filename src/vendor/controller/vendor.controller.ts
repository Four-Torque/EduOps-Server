import { Body, Controller } from '@nestjs/common';
import { VendorService } from '../service/vendor.service';
import { Role } from 'src/global/decorators/role.decorator';
import { CreateVendorRequest } from '../request/create-vendor.request';
import { VendorResponse } from '../response/vendor.response';

@Role('DIRECTOR', 'MANAGER')
@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  async create(@Body() request: CreateVendorRequest): Promise<VendorResponse> {
    const response = await this.vendorService.create(request);
    return response;
  }
}
