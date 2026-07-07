import { IsString, IsInt, IsOptional, IsDateString, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassSyllabusRequest {
  @ApiProperty({ description: '강좌명', example: '초급 영어 회화' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '수강료', example: 100000 })
  @IsInt()
  @Min(0)
  fee: number;

  @ApiProperty({ description: '정원', example: 20 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ description: '시작일', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: '종료일', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: '수강 대상', required: false })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiProperty({ description: '강의 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '커리큘럼 세부 내용', required: false })
  @IsOptional()
  @IsString()
  curriculum?: string;
  
  static toEntity(teacherId: string, request: CreateClassSyllabusRequest) {
    return {
      teacherId,
      name: request.name,
      fee: request.fee,
      capacity: request.capacity,
      startDate: request.startDate ? new Date(request.startDate) : null,
      endDate: request.endDate ? new Date(request.endDate) : null,
      targetAudience: request.targetAudience,
      description: request.description,
      curriculum: request.curriculum,
    };
  }
}
