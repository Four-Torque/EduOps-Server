import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StaffAttendanceService } from '../service/staff-attendance.service';
import { StaffAttendanceResponse } from '../response/staff-attendance.response';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  CurrentUser,
  ErrorCode,
  JwtPayload,
  Message,
  ResponseMessage,
  Role,
} from 'src/global';
import { CreateStaffAttendanceRequest } from '../request/create-staff-attendance.request';
import { UpdateStaffAttendanceRequest } from '../request/update-staff-attendance.request';

@ApiTags('직원 출석')
@Controller('staff-attendance')
export class StaffAttendanceController {
  constructor(
    private readonly staffAttendanceService: StaffAttendanceService,
  ) {}

  @ApiOperation({
    summary: '직원 주간 출석 요약 조회 (관리자용)',
    description:
      '모든 직원의 주간 출석 정보 및 오늘 출근/결근 현황 통계를 조회합니다.',
  })
  @ApiQuery({
    name: 'weekStart',
    required: false,
    description: '주의 월요일 날짜 (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: '부서 필터 (강사, 관리자, 전체)',
  })
  @ApiQuery({ name: 'search', required: false, description: '직원명 검색어' })
  @ApiSuccessResponse(ResponseMessage.ATTENDANCE_FETCHED, null)
  @Message(ResponseMessage.ATTENDANCE_FETCHED)
  @Get('/weekly')
  async getWeeklySummary(
    @Query('weekStart') weekStart?: string,
    @Query('department') department?: string,
    @Query('search') search?: string,
  ) {
    return this.staffAttendanceService.getWeeklySummary(
      weekStart,
      department,
      search,
    );
  }

  @ApiOperation({
    summary: '직원 출석 조회',
    description: '직원의 출석 정보를 조회합니다.',
  })
  @ApiQuery({
    name: 'workDate',
    required: false,
    example: '2026-06-29',
    description: '조회할 날짜 (YYYY-MM-DD)',
  })
  @ApiSuccessResponse(
    ResponseMessage.ATTENDANCE_FETCHED,
    StaffAttendanceResponse,
    true,
  )
  @ApiErrorResponse(ErrorCode.BAD_REQUEST, ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.ATTENDANCE_FETCHED)
  @Get('/')
  async getStaffAttendance(
    @CurrentUser() user: JwtPayload,
    @Query('userId') queryUserId?: string,
    @Query('workDate') workDate?: string,
  ): Promise<StaffAttendanceResponse[]> {
    const isAdmin = user.role === 'MANAGER' || user.role === 'DIRECTOR';
    const targetUserId = isAdmin && queryUserId ? queryUserId : user.id;

    const attendance = await this.staffAttendanceService.getStaffAttendance(
      targetUserId,
      workDate,
    );
    return attendance;
  }

  @Role('MANAGER', 'DIRECTOR')
  @ApiOperation({
    summary: '직원 출석 체크인',
    description: '직원의 출석 체크인을 수행합니다.',
  })
  @ApiSuccessResponse(
    ResponseMessage.ATTENDANCE_CHECKED_IN,
    StaffAttendanceResponse,
  )
  @ApiErrorResponse(
    ErrorCode.ATTENDANCE_ALREADY_EXISTS,
    ErrorCode.USER_NOT_FOUND,
    ErrorCode.INTERNAL_SERVER_ERROR,
  )
  @Message(ResponseMessage.ATTENDANCE_CHECKED_IN)
  @Post('/check-in')
  async checkIn(
    @Body() request: CreateStaffAttendanceRequest,
  ): Promise<StaffAttendanceResponse> {
    const attendance = await this.staffAttendanceService.checkIn(request);
    return attendance;
  }

  @ApiOperation({
    summary: '직원 출석 체크인 수정',
    description: '직원의 출석 체크인 시간을 수정합니다.',
  })
  @ApiSuccessResponse(
    ResponseMessage.ATTENDANCE_UPDATED,
    StaffAttendanceResponse,
  )
  @ApiErrorResponse(
    ErrorCode.ATTENDANCE_NOT_FOUND,
    ErrorCode.INTERNAL_SERVER_ERROR,
  )
  @Message(ResponseMessage.ATTENDANCE_UPDATED)
  @Patch('/:id/check-in')
  async updateCheckIn(
    @Param('id') id: string,
    @Body() request: UpdateStaffAttendanceRequest,
  ): Promise<StaffAttendanceResponse> {
    const attendance = await this.staffAttendanceService.updateCheckIn(
      id,
      request,
    );
    return attendance;
  }

  @ApiOperation({
    summary: '직원 출석 체크아웃',
    description: '직원의 출석 체크아웃을 수행합니다.',
  })
  @ApiSuccessResponse(
    ResponseMessage.ATTENDANCE_UPDATED,
    StaffAttendanceResponse,
  )
  @ApiErrorResponse(
    ErrorCode.ATTENDANCE_NOT_FOUND,
    ErrorCode.ATTENDANCE_ALREADY_CHECKED_OUT,
  )
  @Message(ResponseMessage.ATTENDANCE_UPDATED)
  @Patch('/:id/check-out')
  async checkOut(@Param('id') id: string): Promise<StaffAttendanceResponse> {
    const attendance = await this.staffAttendanceService.checkOut(id);
    return attendance;
  }

  @Role('MANAGER', 'DIRECTOR')
  @ApiOperation({
    summary: '직원 출석 체크아웃 (By User ID)',
    description: '직원의 출석 체크아웃을 수행합니다.',
  })
  @ApiSuccessResponse(
    ResponseMessage.ATTENDANCE_CHECKED_OUT,
    StaffAttendanceResponse,
  )
  @ApiErrorResponse(
    ErrorCode.ATTENDANCE_NOT_FOUND,
    ErrorCode.ATTENDANCE_ALREADY_CHECKED_OUT,
  )
  @Message(ResponseMessage.ATTENDANCE_CHECKED_OUT)
  @Patch('/check-out')
  async checkOutByUser(
    @Body() request: UpdateStaffAttendanceRequest,
  ): Promise<StaffAttendanceResponse> {
    const response =
      await this.staffAttendanceService.checkOutByUserId(request);
    return response;
  }
}
