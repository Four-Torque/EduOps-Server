import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Get,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ClassService } from '../service/class.service';
import { CreateClassRequest } from '../request/create-class.request';
import { ClassResponse } from '../response/class.response';
import { PaginatedClassResponse } from '../response/paginated-class.response';
import { ClassStudentAttendanceResponse } from '../response/class-student-attendance.response';
import { ClassStatus } from '@prisma/client';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  Message,
  ResponseMessage,
} from 'src/global';
import { Role } from 'src/global/decorators/role.decorator';
import { UpdateClassRequest } from '../request/update-class.request';

@ApiTags('강좌')
@Controller('class')
// @Role('DIRECTOR')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @ApiOperation({
    summary: '강좌 생성',
    description: '강좌를 생성합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.CLASS_CREATED, ClassResponse)
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.CLASS_CREATED)
  @Post('/')
  async create(@Body() request: CreateClassRequest): Promise<ClassResponse> {
    const response = await this.classService.create(request);
    return response;
  }

  @ApiOperation({
    summary: '강좌 수정',
    description: '강좌 정보를 업데이트합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.CLASS_UPDATED, ClassResponse)
  @ApiErrorResponse(ErrorCode.CLASS_NOT_FOUND, ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.CLASS_UPDATED)
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() request: UpdateClassRequest,
  ): Promise<ClassResponse> {
    const response = await this.classService.update(id, request);
    return response;
  }

  @ApiOperation({
    summary: '강좌 목록 조회',
    description: '강좌 목록을 조회합니다. name, teacherId, status로 필터 가능',
  })
  @ApiSuccessResponse(null, PaginatedClassResponse)
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'teacherId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ClassStatus })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @Get('/')
  async findAll(
    @Query('name') name?: string,
    @Query('teacherId') teacherId?: string,
    @Query('status') status?: ClassStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedClassResponse> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const response = await this.classService.findAll(
      name,
      teacherId,
      status,
      pageNum,
      limitNum,
    );
    return response;
  }

  @ApiOperation({
    summary: '강좌 상세 조회',
    description: '강좌 상세 정보를 조회합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.CLASS_FETCHED, ClassResponse)
  @ApiErrorResponse(ErrorCode.CLASS_NOT_FOUND)
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<ClassResponse> {
    const response = await this.classService.findById(id);
    return response;
  }

  @ApiOperation({
    summary: '강좌 수강생 출결 리스트 조회',
    description: '특정 강좌의 수강생 목록과 출결 현황을 조회합니다.',
  })
  @ApiSuccessResponse(null, ClassStudentAttendanceResponse, true)
  @ApiErrorResponse(ErrorCode.CLASS_NOT_FOUND)
  @ApiQuery({ name: 'lectureDate', required: true, example: '2023-10-31' })
  @Get('/:id/attendance')
  async getAttendances(
    @Param('id') classId: string,
    @Query('lectureDate') lectureDate: string,
  ): Promise<ClassStudentAttendanceResponse[]> {
    const response = await this.classService.getAttendances(
      classId,
      lectureDate,
    );
    return response;
  }
}
