import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';

export class MessageFilterRequest {
  @ApiProperty({
    description: '페이지 번호',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: '페이지 크기',
    required: false,
    example: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
