import { VendorResponse } from './vendor.response';

export class PaginatedVendorResponse {
  page: number;
  total: number;
  data: VendorResponse[];

  static fromEntity(
    page: number,
    total: number,
    data: VendorResponse[],
  ): PaginatedVendorResponse {
    const response = new PaginatedVendorResponse();
    response.page = page;
    response.total = total;
    response.data = data;
    return response;
  }
}
