import { Injectable } from '@nestjs/common';
import { CreateVendorRequest } from '../request/create-vendor.request';
import { VendorRepository } from '../repository/vendor.repository';
import { VendorResponse } from '../response/vendor.response';
import { PaginatedVendorRequest } from '../request/paginated-vendor.request';
import { PaginatedVendorResponse } from '../response/paignated-vendor.response';
import { ApiException, ErrorCode } from 'src/global';
import { UpdateVendorRequest } from '../request/update-vendor.request';

@Injectable()
export class VendorService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  /**
   * 구매처 생성
   * @param request CreateVendorRequest
   * @returns VendorResponse
   */
  async create(request: CreateVendorRequest): Promise<VendorResponse> {
    const newVendor = await this.vendorRepository.create(
      CreateVendorRequest.toEntity(request),
    );
    const response = VendorResponse.fromEntity(newVendor);
    return response;
  }

  /**
   * 구매처 목록 조회
   * @param request PaginatedVendorRequest
   * @returns PaginatedVendorResponse
   */
  async findAll(
    request: PaginatedVendorRequest,
  ): Promise<PaginatedVendorResponse> {
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

  /**
   * 구매처 상세 조회
   * @param id string
   * @returns VendorResponse
   */
  async findById(id: string): Promise<VendorResponse> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new ApiException(ErrorCode.VENDOR_NOT_FOUND);
    }
    const response = VendorResponse.fromEntity(vendor);
    return response;
  }

  /**
   * 구매처 수정
   * @param id string
   * @param request UpdateVendorRequest
   * @returns VendorResponse
   */
  async update(
    id: string,
    request: UpdateVendorRequest,
  ): Promise<VendorResponse> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new ApiException(ErrorCode.VENDOR_NOT_FOUND);
    }
    const updatedVendor = await this.vendorRepository.update(
      id,
      UpdateVendorRequest.toEntity(request),
    );
    const response = VendorResponse.fromEntity(updatedVendor);
    return response;
  }

  /**
   * 구매처 삭제
   * @param ids string[]
   * @returns void
   */
  async delete(ids: string[]): Promise<void> {
    const vendors = await Promise.all(ids.map((id) => this.findById(id)));
    if (vendors.length !== ids.length) {
      throw new ApiException(ErrorCode.VENDOR_NOT_FOUND);
    }
    await this.vendorRepository.delete(ids);
  }
}
