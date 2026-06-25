import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SalaryService } from '../service/salary.service';
import { SalaryStatus } from '@prisma/client';
import { SalaryResponse } from '../response/salary.response';
import { CreateSalaryRequest } from '../request/create-salary.request';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post('/')
  async createSalary(
    @Body() createSalaryRequest: CreateSalaryRequest,
  ): Promise<SalaryResponse> {
    const response: SalaryResponse =
      await this.salaryService.createSalary(createSalaryRequest);
    return response;
  }

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
}
