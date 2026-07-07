import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ExamService } from '../service/exam.service';
import { CreateExamRequest } from '../request/create-exam.request';
import { UpdateExamRequest } from '../request/update-exam.request';
import { SaveExamResultRequest } from '../request/save-exam-result.request';
import { ExamResponse } from '../response/exam.response';
import { ExamResultResponse } from '../response/exam-result.response';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  Message,
  ResponseMessage,
} from 'src/global';

@ApiTags('수업 테스트')
@Controller('api/exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @ApiOperation({
    summary: '시험 생성',
    description: '새로운 시험을 생성합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.EXAM_CREATED, ExamResponse)
  @ApiErrorResponse(ErrorCode.CLASS_NOT_FOUND, ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.EXAM_CREATED)
  @Post()
  async createExam(@Body() request: CreateExamRequest): Promise<ExamResponse> {
    return this.examService.createExam(request);
  }

  @ApiOperation({
    summary: '특정 강좌의 시험 목록 조회',
    description: 'classId에 해당하는 강좌의 시험 목록을 조회합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.EXAM_FETCHED, ExamResponse, true)
  @ApiErrorResponse(ErrorCode.CLASS_NOT_FOUND, ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.EXAM_FETCHED)
  @ApiQuery({ name: 'classId', required: true })
  @Get()
  async getExamsByClassId(
    @Query('classId') classId: string,
  ): Promise<ExamResponse[]> {
    return this.examService.getExamsByClassId(classId);
  }

  @ApiOperation({
    summary: '시험 정보 수정',
    description: '특정 시험의 정보를 수정합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.EXAM_UPDATED, ExamResponse)
  @ApiErrorResponse(ErrorCode.EXAM_NOT_FOUND, ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.EXAM_UPDATED)
  @Patch(':id')
  async updateExam(
    @Param('id') id: string,
    @Body() request: UpdateExamRequest,
  ): Promise<ExamResponse> {
    return this.examService.updateExam(id, request);
  }

  @ApiOperation({
    summary: '시험 삭제 (점수 결과 연쇄 삭제)',
    description:
      '특정 시험과 그에 연관된 모든 학생의 시험 점수를 함께 삭제합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.EXAM_DELETED)
  @ApiErrorResponse(ErrorCode.EXAM_NOT_FOUND, ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.EXAM_DELETED)
  @Delete(':id')
  async deleteExam(@Param('id') id: string): Promise<void> {
    return this.examService.deleteExam(id);
  }

  @ApiOperation({
    summary: '시험 결과(점수) 일괄 입력 및 수정',
    description:
      '하나 또는 여러 학생의 시험 점수를 배열로 받아 일괄 저장(Upsert)합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.EXAM_RESULT_SAVED)
  @ApiErrorResponse(ErrorCode.EXAM_NOT_FOUND, ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.EXAM_RESULT_SAVED)
  @Post(':id/result')
  async saveExamResults(
    @Param('id') id: string,
    @Body() request: SaveExamResultRequest,
  ): Promise<void> {
    return this.examService.saveExamResults(id, request);
  }

  @ApiOperation({
    summary: '특정 시험의 결과(점수) 목록 조회',
    description:
      '해당 시험에 입력된 모든 학생의 점수 목록을 학생 이름과 함께 조회합니다.',
  })
  @ApiSuccessResponse(
    ResponseMessage.EXAM_RESULT_FETCHED,
    ExamResultResponse,
    true,
  )
  @ApiErrorResponse(ErrorCode.EXAM_NOT_FOUND, ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.EXAM_RESULT_FETCHED)
  @Get(':id/result')
  async getExamResults(@Param('id') id: string): Promise<ExamResultResponse[]> {
    return this.examService.getExamResults(id);
  }
}
