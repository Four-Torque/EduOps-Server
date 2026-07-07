import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class AssetChangeStatusRequest {
  @ApiProperty({ description: '요청 상태', enum: ApplicationStatus })
  status: ApplicationStatus;
  
  @ApiPropertyOptional({ description: '거절 사유', example: '재고 부족' })
  rejectedReason?: string;
}
