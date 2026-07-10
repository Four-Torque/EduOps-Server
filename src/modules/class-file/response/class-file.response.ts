import { ApiProperty } from '@nestjs/swagger';
import { ClassFile } from '@prisma/client';

export class ClassFileResponse {
  @ApiProperty({
    description: '파일 ID',
    example: 'file-uuid-1234',
  })
  id: string;

  @ApiProperty({
    description: '강좌 ID',
    example: 'class-uuid-1234',
  })
  classId: string;

  @ApiProperty({
    description: '원본 파일명',
    example: 'lecture-01.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: '원본 파일 사이즈(byte)',
    example: '15000',
  })
  fileSize: number;

  @ApiProperty({
    description: '업로더 ID',
    example: 'user-uuid-1234',
  })
  uploaderId: string;

  @ApiProperty({
    description: '업로더 이름 (조회 시에만 포함)',
    example: '홍길동 선생님',
    required: false,
  })
  uploaderName?: string;

  @ApiProperty({
    description: '업로드 일시',
  })
  createdAt: Date;

  static fromEntity(
    entity: ClassFile & { uploader?: { name: string } },
  ): ClassFileResponse {
    const response = new ClassFileResponse();
    response.id = entity.id;
    response.classId = entity.classId;
    response.fileName = entity.fileName;
    response.fileSize  = entity.fileSize;
    response.uploaderId = entity.uploaderId;
    if (entity.uploader) {
      response.uploaderName = entity.uploader.name;
    }
    response.createdAt = entity.createdAt;
    return response;
  }
}
