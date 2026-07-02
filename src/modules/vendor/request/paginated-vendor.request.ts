import { IsNumber, IsOptional } from 'class-validator';

export class PaginatedVendorRequest {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
