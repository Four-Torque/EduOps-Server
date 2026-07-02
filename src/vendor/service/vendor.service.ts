import { Injectable } from '@nestjs/common';
import { CreateVendorRequest } from '../request/create-vendor.request';
import { VendorRepository } from '../repository/vendor.repository';
import { VendorResponse } from '../response/vendor.response';
import { PaginatedVendorRequest } from '../request/paginated-vendor.request';
import { PaginatedVendorResponse } from '../response/paignated-vendor.response';
import { ApiException, ErrorCode } from 'src/global';

@Injectable()
export class VendorService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async create(request: CreateVendorRequest): Promise<VendorResponse> {
    const newVendor = await this.vendorRepository.create(
      CreateVendorRequest.toEntity(request),
    );
    const response = VendorResponse.fromEntity(newVendor);
    return response;
  }

  async findAll(request: PaginatedVendorRequest) {
    const { page = 1, limit } = request;
    const take = limit ?? 10;
    const skip = page && take ? (page - 1) * take : 0;

    const [vendors, total] = await Promise.all([
      this.vendorRepository.findAll(take, skip),
      this.vendorRepository.count(take, skip),
    ]);
    const response = PaginatedVendorResponse.fromEntity(page, total, vendors);
    return response;
  }

  async findById(id: string): Promise<VendorResponse> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new ApiException(ErrorCode.VENDOR_NOT_FOUND);
    }
    const response = VendorResponse.fromEntity(vendor);
    return response;
  }
}
