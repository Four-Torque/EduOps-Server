import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

export class ExamResultItemDto {
  @ApiProperty({
    description: '학생 ID',
    example: 'student-uuid-1234',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: '점수',
    example: 95,
  })
  @IsNumber()
  @IsNotEmpty()
  score: number;
}

export class SaveExamResultRequest {
  @ApiProperty({
    description: '시험 결과 목록 (단건도 배열로 전달)',
    type: [ExamResultItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamResultItemDto)
  results: ExamResultItemDto[];
}
