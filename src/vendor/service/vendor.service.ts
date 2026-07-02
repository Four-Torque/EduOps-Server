import { Injectable } from '@nestjs/common';
import { CreateVendorRequest } from '../request/create-vendor.request';
import { VendorRepository } from '../repository/vendor.repository';
import { VendorResponse } from '../response/vendor.response';

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
}
