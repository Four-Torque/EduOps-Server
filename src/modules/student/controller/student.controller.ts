import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StudentService } from '../service/student.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginatedStudentResponse } from '../response/student-list.response';
import { StudentStatus } from '@prisma/client';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  Message,
  ResponseMessage,
} from 'src/global';
import { StudentResponse } from '../response/student.response';
import { CreateStudentRequest } from '../request/create-student.request';
import { UpdateStudentRequest } from '../request/update-student.request';

@ApiTags('학생')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // @TODO: 학생목록조회API 해당 수업정보포함해야할지도
  @ApiOperation({
    summary: '학생 목록 조회',
    description: '학생 목록을 조회합니다. status, name으로 필터 가능',
  })
  @ApiSuccessResponse(
    ResponseMessage.STUDENT_LIST_FETCHED,
    PaginatedStudentResponse,
  )
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.STUDENT_LIST_FETCHED)
  @ApiQuery({ name: 'status', required: false, enum: StudentStatus })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @Get('/')
  async getStudentList(
    @Query('status') status?: StudentStatus,
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedStudentResponse> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const response: PaginatedStudentResponse =
      await this.studentService.getList(status, name, pageNum, limitNum);
    return response;
  }

  @ApiOperation({
    summary: '학생 상세 조회',
    description: '학생의 상세 정보를 조회합니다',
  })
  @ApiSuccessResponse(ResponseMessage.STUDENT_FETCHED, StudentResponse)
  @ApiErrorResponse(ErrorCode.STUDENT_NOT_FOUND)
  @Message(ResponseMessage.STUDENT_FETCHED)
  @Get('/:id')
  async getStudent(@Param('id') id: string): Promise<StudentResponse> {
    const response: StudentResponse = await this.studentService.findById(id);
    return response;
  }

  @ApiOperation({
    summary: '학생 생성',
    description: '새로운 학생을 생성합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.STUDENT_CREATED, StudentResponse)
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.STUDENT_CREATED)
  @Post('/')
  async createStudent(
    @Body() request: CreateStudentRequest,
  ): Promise<StudentResponse> {
    console.log(request);
    const response: StudentResponse = await this.studentService.create(request);
    return response;
  }

  @ApiOperation({
    summary: '학생 정보 수정',
    description: '학생의 정보를 수정합니다',
  })
  @ApiSuccessResponse(ResponseMessage.STUDENT_UPDATED, StudentResponse)
  @ApiErrorResponse(ErrorCode.STUDENT_NOT_FOUND)
  @Message(ResponseMessage.STUDENT_UPDATED)
  @Patch('/:id')
  async updateStudent(
    @Param('id') id: string,
    @Body() request: UpdateStudentRequest,
  ): Promise<StudentResponse> {
    const response: StudentResponse = await this.studentService.update(
      id,
      request,
    );
    return response;
  }
}
