import { Injectable } from '@nestjs/common';
import { AssetRepository } from '../repository/asset.repository';
import { PaginatedAssetApplicationRequest } from '../request/paginated-asset-application.request';
import { PaginatedAssetResponse } from '../response/paginated-asset.response';

@Injectable()
export class AssetService {
  constructor(private readonly assetRepository: AssetRepository) {}

  async findAll(
    branchId: string,
    request: PaginatedAssetApplicationRequest,
  ): Promise<PaginatedAssetResponse> {
    const { page, limit, search } = request;
    const take = limit;
    const skip = page && take ? (page - 1) * take : 0;

    const [assets, total] = await Promise.all([
      this.assetRepository.findAll(branchId, take, skip, search),
      this.assetRepository.count(branchId, take, skip, search),
    ]);
    const response = PaginatedAssetResponse.fromEntity(
      page,
      total,
      Math.ceil(total / take),
      assets,
    );
    return response;
  }
}
