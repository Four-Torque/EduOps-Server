import { ApplicationStatus, Prisma } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AssetChangeStatusRequest {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsString()
  @IsOptional()
  rejectedReason?: string;

  static toEntity(
    request: AssetChangeStatusRequest,
  ): Prisma.AssetsApplicationUpdateInput {
    return {
      status: request.status,
      rejectedReason: request.rejectedReason
        ? request.rejectedReason
        : undefined,
      processedAt: new Date(),
    };
  }
}
