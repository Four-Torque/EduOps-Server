import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginatedAssetApplicationRequest {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
