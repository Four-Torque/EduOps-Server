import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ScheduleService } from '../service/schedule.service';
import { CreateScheduleBulkRequest } from '../request/create-schedule.request';
import { ScheduleResponse } from '../response/schedule.response';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  Message,
  ResponseMessage,
} from 'src/global';
import { ErrorCode } from 'src/global';

@ApiTags('시간표')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @ApiOperation({
    summary: '시간표 (일괄) 등록',
    description: '특정 강좌에 대해 하나 이상의 요일/시간을 일괄 등록합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.SCHEDULE_CREATED)
  @ApiErrorResponse(ErrorCode.CLASS_NOT_FOUND, ErrorCode.BAD_REQUEST)
  @Message(ResponseMessage.SCHEDULE_CREATED)
  @Post('/')
  async createBulk(@Body() request: CreateScheduleBulkRequest): Promise<void> {
    await this.scheduleService.createBulk(request);
  }

  @ApiOperation({
    summary: '강좌별 시간표 조회',
    description: '특정 강좌의 전체 시간표를 조회합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.SCHEDULE_FETCHED, ScheduleResponse, true)
  @ApiErrorResponse(ErrorCode.CLASS_NOT_FOUND)
  @Message(ResponseMessage.SCHEDULE_FETCHED)
  @ApiQuery({ name: 'classId', required: true, description: '조회할 강좌 ID' })
  @Get('/')
  async findAllByClassId(
    @Query('classId') classId: string,
  ): Promise<ScheduleResponse[]> {
    return this.scheduleService.findAllByClassId(classId);
  }

  @ApiOperation({
    summary: '시간표 삭제',
    description: '특정 요일/시간의 시간표 항목 하나를 삭제합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.SCHEDULE_DELETED)
  @ApiErrorResponse(ErrorCode.SCHEDULE_NOT_FOUND)
  @Message(ResponseMessage.SCHEDULE_DELETED)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.scheduleService.delete(id);
  }
}
