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
import { EnrollmentService } from '../service/enrollment.service';
import { CreateEnrollmentRequest } from '../request/create-enrollment.request';
import { EnrollmentResponse } from '../response/enrollment.response';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  Message,
  ResponseMessage,
} from 'src/global';
import { ErrorCode } from 'src/global';

@ApiTags('수강 등록')
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @ApiOperation({
    summary: '수강 등록 (첫 결제 자동 생성)',
    description:
      '학생을 강좌에 등록하고, 초기 수강료 청구서(Payment)를 자동으로 생성합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.ENROLLMENT_CREATED, EnrollmentResponse)
  @ApiErrorResponse(
    ErrorCode.STUDENT_ALREADY_ENROLLED,
    ErrorCode.STUDENT_NOT_FOUND,
    ErrorCode.CLASS_NOT_FOUND,
  )
  @Message(ResponseMessage.ENROLLMENT_CREATED)
  @Post('/')
  async create(
    @Body() request: CreateEnrollmentRequest,
  ): Promise<EnrollmentResponse> {
    const response = await this.enrollmentService.create(request);
    return response;
  }

  @ApiOperation({
    summary: '수강 내역 조회',
    description:
      '전체 수강 내역을 조회합니다. 학생별, 강좌별 필터링이 가능합니다.',
  })
  @ApiSuccessResponse(
    ResponseMessage.ENROLLMENT_FETCHED,
    EnrollmentResponse,
    true,
  )
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.ENROLLMENT_FETCHED)
  @ApiQuery({
    name: 'studentId',
    required: false,
    description: '특정 학생의 수강 내역을 볼 때',
  })
  @ApiQuery({
    name: 'classId',
    required: false,
    description: '특정 강좌의 수강생 목록을 볼 때',
  })
  @Get('/')
  async findAll(
    @Query('studentId') studentId?: string,
    @Query('classId') classId?: string,
  ): Promise<EnrollmentResponse[]> {
    const response = await this.enrollmentService.findAll(studentId, classId);
    return response;
  }

  @ApiOperation({
    summary: '수강 취소 / 삭제',
    description:
      '해당 수강 내역을 삭제합니다. (생성된 청구서는 수동 처리 필요)',
  })
  @ApiSuccessResponse(ResponseMessage.ENROLLMENT_DELETED)
  @ApiErrorResponse(ErrorCode.ENROLLMENT_NOT_FOUND)
  @Message(ResponseMessage.ENROLLMENT_DELETED)
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.enrollmentService.delete(id);
  }
}
