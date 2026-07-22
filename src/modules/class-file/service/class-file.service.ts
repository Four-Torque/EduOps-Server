import { Injectable, Logger } from '@nestjs/common';
import { APP_NAME, FILE_URL, Transactional } from 'src/global';
import { HttpService } from '@nestjs/axios';
import { ClassFileRepository } from '../repository/class-file.repository';
import { ClassFileResponse } from '../response/class-file.response';
import { PaginatedClassFileResponse } from '../response/class-file-list.response';
import { ApiException, ErrorCode } from 'src/global';
import { firstValueFrom } from 'rxjs';
import { UploadClassFileRequest } from '../request/upload-class-file.request';
import { Prisma } from '@prisma/client';
import FormData = require('form-data');

@Injectable()
export class ClassFileService {
  constructor(
    private readonly classFileRepository: ClassFileRepository,
    private readonly httpService: HttpService,
  ) {
    this.LOGGER = new Logger(ClassFileService.name);
  }
  private readonly LOGGER: Logger;

  /**
   * uploadFile 메서드는 업로드된 파일의 메타데이터를 DB에 저장합니다.
   * 실제 파일 업로드 처리는 Controller의 Multer Interceptor가 수행합니다.
   * @param request - 강좌 ID와 업로더 ID
   * @param file - Multer가 처리한 파일 객체
   * @returns Promise<ClassFileResponse> - 저장된 파일 객체를 반환합니다.
   */
  async uploadFile(files: Express.Multer.File[]) {
    let formData = new FormData();
    files.forEach((file) => {
      const filename = file.originalname?.trim() ? file.originalname : 'file';
      formData.append('files', file.buffer, {
        filename,
        contentType: file.mimetype,
      });
    });
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${FILE_URL}/documents`, formData, {
          headers: formData.getHeaders(),
        }),
      );
      return response.data.body.documents ?? [];
    } catch (error) {
      this.LOGGER.error(
        `파일 업로드 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new ApiException(ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  @Transactional()
  async createFile(request: UploadClassFileRequest, userId: string) {
    const { classId, urls, fileName, fileSize } = request;

    if (!urls || urls.length === 0) {
      throw new ApiException(ErrorCode.CLASS_FILE_NOT_FOUND);
    }

    try {
      const initialEntity: Prisma.ClassFileCreateInput =
        UploadClassFileRequest.toEntity(
          {
            classId,
            urls,
            existingDocuments: [],
            fileName,
            fileSize,
          },
          userId,
        );

      if (!initialEntity) {
        return [];
      }

      const savedClassFile = await this.classFileRepository.save(initialEntity);

      const classFileId = savedClassFile?.id;

      if (!classFileId) {
        throw new ApiException(ErrorCode.CLASS_FILE_CREATE_FAILED);
      }

      const requestObj = {
        id: classFileId,
        documents: urls,
        existingDocuments: [],
        entity: 'classFile',
      };

      const res = await firstValueFrom(
        this.httpService.post(
          `${FILE_URL}/documents/${APP_NAME}/create`,
          requestObj,
        ),
      );
      const finalUrls = res.data?.body?.documents ?? [];

      await this.classFileRepository.updateUrl(classFileId, finalUrls[0]);

      const classFiles = await this.classFileRepository.findAllByclassId([
        classId,
      ]);

      return classFiles.map((classFile) =>
        ClassFileResponse.fromEntity(classFile),
      );
    } catch (error) {
      if (error instanceof ApiException) {
        this.LOGGER.error(`ClassFile 생성 중 에러 발생: ${error.message}`);
        throw error;
      }
      throw error;
    }
  }

  /**
   * getFilesByClassId 메서드는 특정 강좌에 등록된 파일 목록을 조회합니다.
   * @param classId - 강좌 ID
   * @returns Promise<PaginatedClassFileResponse>
   */
  async getFilesByClassId(
    userId: string,
    classId?: string,
    search?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedClassFileResponse> {
    const { files, total } = await this.classFileRepository.findClassFiles(
      userId,
      classId,
      search,
      page,
      limit,
    );
    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: files.map((file) => ClassFileResponse.fromEntity(file)),
    };
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

    return { filePath: fileEntity.filePath, fileName: fileEntity.fileName };
  }

  async getFileStream(url: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { responseType: 'stream' }),
      );
      return response.data;
    } catch (error) {
      this.LOGGER.error(
        `Failed to stream file from external server: ${url}`,
        error,
      );
      throw new ApiException(ErrorCode.CLASS_FILE_NOT_FOUND);
    }
  }

  /**
   * deleteFile 메서드는 DB 기록을 지우고 물리적인 로컬 파일도 삭제합니다.
   * @param id - 파일 ID
   * @throws ApiException - 파일이 존재하지 않을 경우
   */
  @Transactional()
  async deleteFiles(ids: string[]): Promise<void> {
    const fileEntity = await this.classFileRepository.findByIds(ids);
    if (!fileEntity || fileEntity.length === 0) {
      throw new ApiException(ErrorCode.CLASS_FILE_NOT_FOUND);
    }

    const requestObj = {
      ids: fileEntity.map((file) => file.id),
      serviceName: APP_NAME,
      entity: 'classFile',
    };

    try {
      await firstValueFrom(
        this.httpService.delete<boolean>(
          `${FILE_URL}/documents/${APP_NAME}/delete`,
          { data: requestObj },
        ),
      );

      await this.classFileRepository.delete(ids);
    } catch (error) {
      this.LOGGER.error(
        `Failed to delete file from external server: ${fileEntity.map((file) => file.filePath).join(', ')}`,
        error,
      );
      throw new ApiException(ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }
}
