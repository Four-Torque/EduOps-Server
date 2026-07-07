import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginatedAssetApplicationRequest {
  @ApiPropertyOptional({ description: '페이지 번호', example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: '페이지당 항목 수', example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: '검색어', example: '노트북' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '요청 상태', example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: string;
}
