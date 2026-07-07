import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadClassFileRequest {
  @ApiProperty({
    description: '강좌 ID',
    example: 'class-uuid-1234',
  })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({
    description: '업로드할 파일',
    type: 'string',
    format: 'binary',
  })
  file: any;
}
