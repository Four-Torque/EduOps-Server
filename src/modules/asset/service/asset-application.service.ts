import { Injectable } from '@nestjs/common';
import { AssetApplicationRepository } from '../repository/asset-application.repository';
import { AssetApplicationRequest } from '../request/asset-application.request';
import { AssetApplicationResponse } from '../response/asset-application.response';
import { PaginatedAssetApplicationRequest } from '../request/paginated-asset-application.request';
import { PaginatedAssetApplicationResponse } from '../response/paginated-asset-application.response';
import { ApiException, ErrorCode, Transactional } from 'src/global';
import { ApplicationStatus } from '@prisma/client';
import { AssetRepository } from '../repository/asset.repository';
import { AssetChangeStatusRequest } from '../request/asset-change-status.request';

@Injectable()
export class AssetApplicationService {
  constructor(
    private readonly assetApplicationRepository: AssetApplicationRepository,
    private readonly assetRepository: AssetRepository,
  ) {}

  @Transactional()
  async create(
    request: AssetApplicationRequest,
    userId: string,
  ): Promise<AssetApplicationResponse> {
    const newAssetApplication = await this.assetApplicationRepository.create(
      AssetApplicationRequest.toEntity(request, userId),
    );
    const response = AssetApplicationResponse.fromEntity(newAssetApplication);
    return response;
  }

  async findAll(
    request: PaginatedAssetApplicationRequest,
  ): Promise<PaginatedAssetApplicationResponse> {
    const { page = 1, limit, status } = request;
    const take = limit ?? 10;
    const skip = page && take ? (page - 1) * take : 0;

    const [assetApplications, total] = await Promise.all([
      this.assetApplicationRepository.findAll(take, skip, status),
      this.assetApplicationRepository.count(take, skip, status),
    ]);

    const assetNames = assetApplications.map((app) => app.name);
    const assetStocks =
      await this.assetApplicationRepository.findNameAndStockByAssetName(
        assetNames,
      );
    const stockMap = new Map(
      assetStocks.map((asset) => [asset.name, asset.stock]),
    );
    const data = assetApplications.map((app) => {
      const stock = stockMap.get(app.name) ?? 0;
      return AssetApplicationResponse.fromEntity(app, stock);
    });

    const response = PaginatedAssetApplicationResponse.fromEntity(
      page,
      total,
      Math.ceil(total / take),
      data,
    );
    return response;
  }

  async findById(id: string): Promise<AssetApplicationResponse> {
    const assetApplication = await this.assetApplicationRepository.findById(id);
    if (!assetApplication) {
      throw new ApiException(ErrorCode.ASSET_APPLICATION_NOT_FOUND);
    }
    const response = AssetApplicationResponse.fromEntity(assetApplication);
    return response;
  }

  @Transactional()
  async changeStatus(
    id: string,
    request: AssetChangeStatusRequest,
  ): Promise<void> {
    const assetApplication = await this.assetApplicationRepository.findById(id);
    if (!assetApplication) {
      throw new ApiException(ErrorCode.ASSET_APPLICATION_NOT_FOUND);
    }

    if (request.status === ApplicationStatus.ACCEPTED) {
      await Promise.all([
        this.assetApplicationRepository.updateStatus(
          id,
          AssetChangeStatusRequest.toEntity(request),
        ),
        this.assetRepository.updateStock(assetApplication),
      ]);
    } else {
      await this.assetApplicationRepository.updateStatus(
        id,
        AssetChangeStatusRequest.toEntity(request),
      );
    }
  }

  async delete(ids: string[]) {
    console.log('delete called with ids:', JSON.stringify(ids));
    const assetApplications =
      await this.assetApplicationRepository.findByIds(ids);
    if (assetApplications.length !== ids.length) {
      throw new ApiException(ErrorCode.ASSET_APPLICATION_NOT_FOUND);
    }
    await this.assetApplicationRepository.delete(ids);
  }
}
