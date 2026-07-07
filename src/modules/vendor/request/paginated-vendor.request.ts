import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginatedVendorRequest {
  @ApiPropertyOptional({ description: '페이지 번호', example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: '페이지당 항목 수', example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
