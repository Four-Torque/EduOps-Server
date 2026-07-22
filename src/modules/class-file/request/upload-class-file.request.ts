import { Prisma } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';

export class UploadClassFileRequest {
  @IsString()
  classId: string;

  @IsString({ each: true })
  urls: string[];

  @IsString({ each: true })
  existingDocuments?: string[];

  @IsString()
  fileName?: string;

  @IsNumber()
  fileSize?: number;

  static toEntity(
    request: UploadClassFileRequest,
    userId: string,
  ): Prisma.ClassFileCreateInput {
    const { classId, urls, fileName, fileSize } = request;

    return {
      class: { connect: { id: classId } },
      fileName: fileName || urls[0].split('/').pop() || '',
      filePath: urls[0],
      fileSize: fileSize || 0,
      uploader: { connect: { id: userId } },
    };
  }
}
