import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SalaryService } from '../service/salary.service';
import { SalaryStatus } from '@prisma/client';
import { SalaryResponse } from '../response/salary.response';
import { CreateSalaryRequest } from '../request/create-salary.request';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  Message,
  ResponseMessage,
} from 'src/global';

@ApiTags('급여')
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @ApiOperation({
    summary: '급여 생성',
    description: '급여를 생성합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.SALARY_CREATED, SalaryResponse)
  @ApiErrorResponse(ErrorCode.USER_NOT_FOUND)
  @Message(ResponseMessage.SALARY_CREATED)
  @Post('/')
  async createSalary(
    @Body() createSalaryRequest: CreateSalaryRequest,
  ): Promise<SalaryResponse> {
    const response: SalaryResponse =
      await this.salaryService.createSalary(createSalaryRequest);
    return response;
  }

  @ApiOperation({
    summary: '급여 조회',
    description: '사용자의 급여를 조회합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.SALARY_FETCHED, SalaryResponse, true)
  @ApiErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR)
  @Message(ResponseMessage.SALARY_FETCHED)
  @Get('/')
  async getSalary(
    @Query('userId') userId: string,
    @Query('status') status?: SalaryStatus,
  ): Promise<SalaryResponse[]> {
    const response: SalaryResponse[] = await this.salaryService.getSalary(
      userId,
      status,
    );
    return response;
  }

  @ApiOperation({
    summary: '급여 지급 상태 변경',
    description: '급여의 지급 상태를 변경합니다.',
  })
  @ApiSuccessResponse(ResponseMessage.SALARY_PAID, SalaryResponse)
  @ApiErrorResponse(ErrorCode.SALARY_NOT_FOUND, ErrorCode.SALARY_ALREADY_PAID)
  @Message(ResponseMessage.SALARY_PAID)
  @Patch('/:id/pay')
  async paySalary(@Param('id') id: string): Promise<SalaryResponse> {
    const response: SalaryResponse = await this.salaryService.paySalary(id);
    return response;
  }
}
