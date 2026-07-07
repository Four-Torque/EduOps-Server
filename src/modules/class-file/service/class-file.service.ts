import { Injectable } from '@nestjs/common';
import { ClassFileRepository } from '../repository/class-file.repository';
import { UploadClassFileRequest } from '../request/upload-class-file.request';
import { ClassFileResponse } from '../response/class-file.response';
import { ApiException, ErrorCode } from 'src/global';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ClassFileService {
  constructor(private readonly classFileRepository: ClassFileRepository) {}

  /**
   * uploadFile 메서드는 업로드된 파일의 메타데이터를 DB에 저장합니다.
   * 실제 파일 업로드 처리는 Controller의 Multer Interceptor가 수행합니다.
   * @param request - 강좌 ID와 업로더 ID
   * @param file - Multer가 처리한 파일 객체
   * @returns Promise<ClassFileResponse> - 저장된 파일 객체를 반환합니다.
   */
  async uploadFile(
    request: UploadClassFileRequest,
    file: Express.Multer.File,
    userId: string,
  ): Promise<ClassFileResponse> {
    if (!file) {
      throw new ApiException(ErrorCode.FILE_NOT_PROVIDED);
    }

    const entity = await this.classFileRepository.create({
      fileName: file.originalname,
      filePath: file.path, // Multer에 의해 지정된 로컬 경로 (예: uploads/class-files/xxx.pdf)
      class: { connect: { id: request.classId } },
      uploader: { connect: { id: userId } },
    });

    return ClassFileResponse.fromEntity(entity);
  }

  /**
   * getFilesByClassId 메서드는 특정 강좌에 등록된 모든 파일 목록을 조회합니다.
   * @param classId - 강좌 ID
   * @returns Promise<ClassFileResponse[]>
   */
  async getFilesByClassId(classId: string): Promise<ClassFileResponse[]> {
    const files = await this.classFileRepository.findByClassId(classId);
    return files.map((file) => ClassFileResponse.fromEntity(file));
  }

  /**
   * getFileForDownload 메서드는 파일 다운로드를 위해 파일의 물리적 경로 및 원본 이름을 반환합니다.
   * @param id - 파일 ID
   * @returns Promise<{ filePath: string; fileName: string }>
   * @throws ApiException - 파일이 없거나 물리적으로 존재하지 않을 경우
   */
  async getFileForDownload(
    id: string,
  ): Promise<{ filePath: string; fileName: string }> {
    const fileEntity = await this.classFileRepository.findById(id);
    if (!fileEntity) {
      throw new ApiException(ErrorCode.CLASS_FILE_NOT_FOUND);
    }

    // 파일이 디스크에 실제 존재하는지 확인
    const absolutePath = path.resolve(fileEntity.filePath);
    if (!fs.existsSync(absolutePath)) {
      throw new ApiException(ErrorCode.CLASS_FILE_NOT_FOUND_ON_DISK);
    }

    return { filePath: absolutePath, fileName: fileEntity.fileName };
  }

  /**
   * deleteFile 메서드는 DB 기록을 지우고 물리적인 로컬 파일도 삭제합니다.
   * @param id - 파일 ID
   * @throws ApiException - 파일이 존재하지 않을 경우
   */
  async deleteFile(id: string): Promise<void> {
    const fileEntity = await this.classFileRepository.findById(id);
    if (!fileEntity) {
      throw new ApiException(ErrorCode.CLASS_FILE_NOT_FOUND);
    }

    // 1. 물리적 파일 삭제 (에러 무시 가능하도록 try-catch)
    try {
      const absolutePath = path.resolve(fileEntity.filePath);
      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
      }
    } catch (e) {
      console.warn(`Failed to delete file physically: ${fileEntity.filePath}`);
    }

    // 2. DB 기록 삭제
    await this.classFileRepository.delete(id);
  }
}
