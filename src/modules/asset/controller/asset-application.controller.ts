import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AssetApplicationService } from '../service/asset-application.service';
import { AssetApplicationRequest } from '../request/asset-application.request';
import { AssetApplicationResponse } from '../response/asset-application.response';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  CurrentUser,
  ErrorCode,
  JwtPayload,
  Message,
  ResponseMessage,
  Role,
} from 'src/global';
import { PaginatedAssetApplicationRequest } from '../request/paginated-asset-application.request';
import { PaginatedAssetApplicationResponse } from '../response/paginated-asset-application.response';
import { AssetChangeStatusRequest } from '../request/asset-change-status.request';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/modules/auth/guards/jwt.guard';

@ApiTags('자재 요청')
@Controller('asset-application')
@UseGuards(JwtGuard)
export class AssetApplicationController {
  constructor(
    private readonly assetApplicationService: AssetApplicationService,
  ) {}

  @Role('MANAGER', 'DIRECTOR')
  @ApiOperation({
    summary: '자재 요청 생성',
    description: '자재 요청을 생성합니다.',
  })
  @ApiSuccessResponse(
    ResponseMessage.ASSET_APPLICATION_CREATED,
    AssetApplicationResponse,
  )
  @Message(ResponseMessage.ASSET_APPLICATION_CREATED)
  @Post()
  async create(
    @Body() request: AssetApplicationRequest,
    @CurrentUser() user: JwtPayload,
  ): Promise<AssetApplicationResponse> {
    const response = await this.assetApplicationService.create(
      request,
      user.id,
      user.branchId,
    );
    return response;
  }

  @Role('MANAGER', 'DIRECTOR')
  @ApiOperation({
    summary: '자재 요청 목록 조회',
    description: '자재 요청 목록을 조회합니다.',
  })
  @ApiSuccessResponse(null, PaginatedAssetApplicationResponse)
  @Get()
  async findAll(
    @Query() request: PaginatedAssetApplicationRequest,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedAssetApplicationResponse> {
    const response = await this.assetApplicationService.findAll(user.branchId, request);
    return response;
  }

  @Role('MANAGER', 'DIRECTOR')
  @ApiOperation({
    summary: '자재 요청 상세 조회',
    description: '자재 요청 상세를 조회합니다.',
  })
  @ApiSuccessResponse(null, AssetApplicationResponse)
  @ApiErrorResponse(ErrorCode.ASSET_APPLICATION_NOT_FOUND)
  @Get(':id')
  async findById(@Param('id') id: string): Promise<AssetApplicationResponse> {
    const response = await this.assetApplicationService.findById(id);
    return response;
  }

  @Role('DIRECTOR')
  @ApiOperation({
    summary: '자재 요청 상태 변경',
    description: '자재 요청 상태를 변경합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.ASSET_APPLICATION_STATUS_CHANGED)
  @ApiErrorResponse(ErrorCode.ASSET_APPLICATION_NOT_FOUND)
  @Message(ResponseMessage.ASSET_APPLICATION_STATUS_CHANGED)
  @Put(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() request: AssetChangeStatusRequest,
  ): Promise<void> {
    await this.assetApplicationService.changeStatus(id, request);
  }

  @Role('MANAGER', 'DIRECTOR')
  @ApiOperation({
    summary: '자재 요청 삭제',
    description: '자재 요청을 삭제합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.ASSET_APPLICATION_DELETED)
  @ApiErrorResponse(ErrorCode.ASSET_APPLICATION_NOT_FOUND)
  @Message(ResponseMessage.ASSET_APPLICATION_DELETED)
  @Delete()
  async delete(@Body('ids') ids: string[]): Promise<void> {
    await this.assetApplicationService.delete(ids);
  }
}
