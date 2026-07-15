import { Controller, Get, Query } from '@nestjs/common';
import { FinanceService } from '../service/finance.service';
import { Role } from 'src/global';

@Role('DIRECTOR')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('period')
  async getFinanceByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const response = await this.financeService.getFinanceByPeriod(
      startDate,
      endDate,
    );
    return response;
  }

  @Get('assets')
  async getAssetChart(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const response = await this.financeService.getAssetFinanceByPeriod(
      startDate,
      endDate,
    );
    return response;
  }

  @Get('payments')
  async getPaymentChart(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const response = await this.financeService.getPaymentFinanceByPeriod(
      startDate,
      endDate,
    );
    return response;
  }

  @Get('salaries')
  async getSalaryChart(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const response = await this.financeService.getSalaryFinanceByPeriod(
      startDate,
      endDate,
    );
    return response;
  }
}
