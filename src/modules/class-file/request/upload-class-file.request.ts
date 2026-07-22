import { Prisma } from '@prisma/client';

export class UploadClassFileRequest {
  classId: string;
  urls: string[];
  existingDocuments?: string[];

  static toEntity(
    request: UploadClassFileRequest,
    userId: string,
  ): Prisma.ClassFileCreateManyInput[] {
    const { classId, urls } = request;

    return urls.map((url) => ({
      url,
      classId,
      fileName: url.split('/').pop() || '',
      filePath: url,
      fileSize: 0,
      fileType: url.split('.').pop() || '',
      uploaderId: userId,
    }));
  }
}
