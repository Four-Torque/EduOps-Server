import { Injectable, Logger } from '@nestjs/common';
import { APP_NAME, FILE_URL } from 'src/global';
import { HttpService } from '@nestjs/axios';
import { ClassFileRepository } from '../repository/class-file.repository';
import { ClassFileResponse } from '../response/class-file.response';
import { PaginatedClassFileResponse } from '../response/class-file-list.response';
import { ApiException, ErrorCode } from 'src/global';
import * as fs from 'fs';
import * as path from 'path';
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
      console.log('파일명:', file.originalname);
      console.log('버퍼 존재 여부:', file.buffer);
      const filename = file.originalname?.trim() ? file.originalname : 'file';
      formData.append('files', file.buffer, {
        filename,
        contentType: file.mimetype,
      });
    });

    console.log('formData: ', formData);
    try {
      const response = await firstValueFrom(
        this.httpService.post<string[]>(`${FILE_URL}/documents`, formData, {
          headers: formData.getHeaders(),
        }),
      );

      return response.data ?? [];
    } catch (error) {
      this.LOGGER.error(
        `파일 업로드 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new ApiException(ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  async createFile(request: UploadClassFileRequest, userId: string) {
    const { classId, urls } = request;
    if (!urls || urls.length === 0) {
      throw new ApiException(ErrorCode.CLASS_FILE_NOT_FOUND);
    }

    const requestObj = {
      id: classId,
      images: urls,
      existingImages: [],
      entity: 'classFile',
    };

    try {
      this.LOGGER.log(`1. 문서 생성 요청 전송 중`);
      const res = await firstValueFrom(
        this.httpService.post(
          `${FILE_URL}/documents/${APP_NAME}/create`,
          requestObj,
        ),
      );
      this.LOGGER.log(`2. 문서 생성 요청 완료`);

      this.LOGGER.log(`3. 문서 생성 결과 처리 중`);
      console.log('응답받은 문서들: ', res.data);
      const classFileObj: Prisma.ClassFileCreateManyInput[] =
        UploadClassFileRequest.toEntity(
          {
            classId,
            urls: res.data.body.documents ?? [],
          },
          userId,
        );

      if (classFileObj.length === 0) {
        return [];
      }
      await this.classFileRepository.saveAll(classFileObj);
      this.LOGGER.log(`4. 문서들 저장 완료`);
      const classFiles = await this.classFileRepository.findAllByclassId([
        classId,
      ]);
      this.LOGGER.log(`5. 문서들 조회 완료`);
      const response = classFiles.map((classFile) =>
        ClassFileResponse.fromEntity(classFile),
      );
      return response;
    } catch (error) {
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
    fileName?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedClassFileResponse> {
    const { files, total } = await this.classFileRepository.findClassFiles(
      userId,
      classId,
      fileName,
      page,
      limit,
    );
    return {
      total,
      page,
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
