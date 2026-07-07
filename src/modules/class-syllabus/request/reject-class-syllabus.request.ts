import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectClassSyllabusRequest {
  @ApiProperty({ description: '반려 사유', example: '커리큘럼 내용이 부실합니다.' })
  @IsString()
  @IsNotEmpty()
  rejectedReason: string;
}
