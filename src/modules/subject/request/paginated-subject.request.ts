import { IsOptional, IsNumber } from 'class-validator';

export class PaginatedSubjectRequest {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  search?: string;
}
