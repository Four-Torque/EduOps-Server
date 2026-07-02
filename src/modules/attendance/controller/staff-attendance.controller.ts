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
  ErrorCode,
  Message,
  ResponseMessage,
} from 'src/global';
import { CreateStaffAttendanceRequest } from '../request/create-staff-attendance.request';

@ApiTags('직원 출석')
@Controller('staff-attendance')
export class StaffAttendanceController {
  constructor(
    private readonly staffAttendanceService: StaffAttendanceService,
  ) {}

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
    @Query('userId') userId: string,
    @Query('workDate') workDate?: string,
  ): Promise<StaffAttendanceResponse[]> {
    const attendance = await this.staffAttendanceService.getStaffAttendance(
      userId,
      workDate,
    );
    return attendance;
  }

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
}
