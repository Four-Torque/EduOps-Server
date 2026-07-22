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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ClassFileService } from '../service/class-file.service';
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
import { UploadClassFileRequest } from '../request/upload-class-file.request';

@ApiTags('수업 파일')
@Controller('class-file')
export class ClassFileController {
  constructor(private readonly classFileService: ClassFileService) {}

  @ApiOperation({
    summary: '수업 파일 업로드',
    description:
      '강좌에 필요한 파일을 서버에 업로드합니다. (multipart/form-data)',
  })
  @ApiSuccessResponse(ResponseMessage.CLASS_FILE_UPLOADED, ClassFileResponse)
  @ApiErrorResponse(ErrorCode.BAD_REQUEST, ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.CLASS_FILE_UPLOADED)
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    return this.classFileService.uploadFile(files);
  }

  @Post('create')
  async createFile(
    @CurrentUser() user: JwtPayload,
    @Body() request: UploadClassFileRequest,
  ) {
    await this.classFileService.createFile(request, user.id);
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
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @Get()
  async getFilesByClassId(
    @CurrentUser() user: JwtPayload,
    @Query('classId') classId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedClassFileResponse> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    return this.classFileService.getFilesByClassId(
      user.id,
      classId,
      search,
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

    const fileStream = await this.classFileService.getFileStream(filePath);

    const encodedFileName = encodeURIComponent(fileName);

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
  @Delete()
  async deleteFile(@Body('ids') ids: string[]): Promise<void> {
    return this.classFileService.deleteFiles(ids);
  }
}
