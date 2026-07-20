import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClassFileService } from '../service/class-file.service';
import { UploadClassFileRequest } from '../request/upload-class-file.request';
import { ClassFileResponse } from '../response/class-file.response';
import { PaginatedClassFileResponse } from '../response/class-file-list.response';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  CurrentUser,
  ErrorCode,
  JwtPayload,
  Message,
  ResponseMessage,
} from 'src/global';
import { Response } from 'express';
import * as fs from 'fs';

@ApiTags('수업 파일')
@Controller('class-file')
export class ClassFileController {
  constructor(private readonly classFileService: ClassFileService) {}

  @ApiOperation({
    summary: '수업 파일 업로드',
    description:
      '강좌에 필요한 파일을 서버에 업로드합니다. (multipart/form-data)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiSuccessResponse(ResponseMessage.CLASS_FILE_UPLOADED, ClassFileResponse)
  @ApiErrorResponse(ErrorCode.BAD_REQUEST, ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.CLASS_FILE_UPLOADED)
  @Post()
  @UseInterceptors(FileInterceptor('file')) 
  async uploadFile(
    @CurrentUser() user: JwtPayload,
    @Body() request: UploadClassFileRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ClassFileResponse> {
    return this.classFileService.uploadFile(user.id, request, file);
  }

  @ApiOperation({
    summary: '파일 목록 조회',
    description: '업로드된 수업 자료(파일) 목록을 조회합니다.',
  })
  @ApiSuccessResponse(
    ResponseMessage.CLASS_FILE_FETCHED,
    PaginatedClassFileResponse,
  )
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.CLASS_FILE_FETCHED)
  @ApiQuery({ name: 'classId', required: false })
  @ApiQuery({ name: 'fileName', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @Get()
  async getFilesByClassId(
    @CurrentUser() user: JwtPayload,
    @Query('classId') classId?: string,
    @Query('fileName') fileName?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedClassFileResponse> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    return this.classFileService.getFilesByClassId(
      user.id,
      classId,
      fileName,
      pageNum,
      limitNum,
    );
  }

  @ApiOperation({
    summary: '파일 다운로드 API',
    description: '파일 ID를 통해 서버에 저장된 원본 파일을 다운로드합니다.',
  })
  @ApiErrorResponse(ErrorCode.CLASS_FILE_NOT_FOUND)
  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { filePath, fileName } =
      await this.classFileService.getFileForDownload(id);

    // 파일 스트림 생성
    const fileStream = fs.createReadStream(filePath);

    // 한글 등 특수문자 파일명을 위한 URL 인코딩
    const encodedFileName = encodeURIComponent(fileName);

    // 다운로드를 위한 헤더 설정
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
    });

    return new StreamableFile(fileStream);
  }

  @ApiOperation({
    summary: '수업 파일 삭제',
    description: 'DB 기록과 함께 물리적인 파일도 디스크에서 삭제합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.CLASS_FILE_DELETED)
  @ApiErrorResponse(
    ErrorCode.CLASS_FILE_NOT_FOUND,
    ErrorCode.INTERNAL_SERVER_ERROR,
  )
  @Message(ResponseMessage.CLASS_FILE_DELETED)
  @Delete(':id')
  async deleteFile(@Param('id') id: string): Promise<void> {
    return this.classFileService.deleteFile(id);
  }
}
