import { Controller, Get, Query } from '@nestjs/common';
import { AssetService } from '../service/asset.service';
import { PaginatedAssetApplicationRequest } from '../request/paginated-asset-application.request';
import { ApiSuccessResponse, Role } from 'src/global';
import { ApiOperation } from '@nestjs/swagger';
import { PaginatedAssetResponse } from '../response/paginated-asset.response';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Role('MANAGER', 'DIRECTOR')
  @ApiOperation({
    summary: '자재 목록 조회',
    description: '자재 목록을 조회합니다.',
  })
  @ApiSuccessResponse(null, PaginatedAssetResponse)
  @Get()
  async findAll(@Query() request: PaginatedAssetApplicationRequest) {
    const response = await this.assetService.findAll(request);
    return response;
  }
}
