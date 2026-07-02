import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StudentAttendanceService } from '../service/student-attendance.service';
import { CreateStudentAttendanceRequest } from '../request/create-student-attendance.request';
import { StudentAttendanceResponse } from '../response/student-attendance.response';
import { StudentAttendanceStatus } from '@prisma/client';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  Message,
  ResponseMessage,
} from 'src/global';

@ApiTags('학생 출석')
@Controller('student-attendance')
export class StudentAttendanceController {
  constructor(
    private readonly studentAttendanceService: StudentAttendanceService,
  ) {}

  @ApiOperation({
    summary: '학생 출결 생성',
    description: '학생 출결을 생성합니다',
  })
  @ApiSuccessResponse(ResponseMessage.ATTENDANCE_CREATED)
  @ApiErrorResponse(
    ErrorCode.STUDENT_NOT_FOUND,
    ErrorCode.INTERNAL_SERVER_ERROR,
  )
  @Message(ResponseMessage.ATTENDANCE_CREATED)
  @Post('/')
  async createAttendance(
    @Body() request: CreateStudentAttendanceRequest,
  ): Promise<StudentAttendanceResponse> {
    const attendance = await this.studentAttendanceService.create(request);
    return attendance;
  }

  @ApiOperation({
    summary: '학생 출결 상태 변경',
    description: '학생 출결의 상태를 변경합니다',
  })
  @ApiSuccessResponse(ResponseMessage.ATTENDANCE_UPDATED)
  @ApiErrorResponse(ErrorCode.ATTENDANCE_NOT_FOUND)
  @Message(ResponseMessage.ATTENDANCE_UPDATED)
  @Patch('/:id')
  async updateAttendance(
    @Param('id') id: string,
    @Body('status') status: StudentAttendanceStatus,
  ): Promise<StudentAttendanceResponse> {
    const attendance = await this.studentAttendanceService.update(id, status);
    return attendance;
  }

  @ApiOperation({
    summary: '학생 출결 목록 조회',
    description: 'studentId, classId, lectureDate로 필터 가능',
  })
  @ApiSuccessResponse(
    ResponseMessage.ATTENDANCE_FETCHED,
    StudentAttendanceResponse,
    true,
  )
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.ATTENDANCE_FETCHED)
  @Get('/')
  async getAttendanceList(
    @Query('studentId') studentId?: string,
    @Query('classId') classId?: string,
    @Query('lectureDate') lectureDate?: string,
  ): Promise<StudentAttendanceResponse[]> {
    return this.studentAttendanceService.findList(
      studentId,
      classId,
      lectureDate,
    );
  }
}
