import { Injectable } from '@nestjs/common';
import { AssetRepository } from 'src/modules/asset/repository/asset.repository';
import { PaymentRepository } from 'src/modules/payment/repository/payment.repository';
import { SalaryRepository } from 'src/modules/salary/repository/salary.repository';
import {
  FinanceDetailResponse,
  FinanceResponse,
} from '../response/finance.response';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

@Injectable()
export class FinanceService {
  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly salaryRepository: SalaryRepository,
  ) {}

  async getFinanceByPeriod(
    startDate: string,
    endDate: string,
  ): Promise<FinanceResponse[]> {
    const [asset, payment, salary] = await Promise.all([
      this.assetRepository.getAssetApplicationsByStartDateAndEndDate(
        startDate,
        endDate,
      ),
      this.paymentRepository.getPaymentsByStartDateAndEndDate(
        startDate,
        endDate,
      ),
      this.salaryRepository.getSalariesByStartDateAndEndDate(
        startDate,
        endDate,
      ),
    ]);
    const allDetails = [
      ...asset.map(FinanceDetailResponse.fromAssetApplications),
      ...payment.map(FinanceDetailResponse.fromPayment),
      ...salary.map(FinanceDetailResponse.fromSalary),
    ];

    return this.groupAndFormatDetails(allDetails);
  }

  async getAssetFinanceByPeriod(startDate: string, endDate: string) {
    const assets =
      await this.assetRepository.getAssetApplicationsByStartDateAndEndDate(
        startDate,
        endDate,
      );
    const details = assets.map(FinanceDetailResponse.fromAssetApplications);

    const response = this.groupAndFormatDetails(details);
    console.log('response', response);
    return response;
  }

  async getPaymentFinanceByPeriod(startDate: string, endDate: string) {
    const payments =
      await this.paymentRepository.getPaymentsByStartDateAndEndDate(
        startDate,
        endDate,
      );
    const details = payments.map(FinanceDetailResponse.fromPayment);

    const response = this.groupAndFormatDetails(details);
    console.log('response', response);
    return response;
  }

  async getSalaryFinanceByPeriod(
    startDate: string,
    endDate: string,
  ): Promise<any[]> {
    const salaries =
      await this.salaryRepository.getSalariesByStartDateAndEndDate(
        startDate,
        endDate,
      );
    const details = salaries.map(FinanceDetailResponse.fromSalary);

    const response = this.groupAndFormatDetails(details);
    console.log('response', response);
    return response;
  }

  private groupAndFormatDetails(details: FinanceDetailResponse[]): any[] {
    const groups: { [key: string]: FinanceDetailResponse[] } = {};

    details.forEach((detail) => {
      const dateKey = detail.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(detail);
    });

    const result = Object.keys(groups).map((dateKey) => {
      const items = groups[dateKey];
      let totalIncome = 0;
      let totalExpense = 0;

      items.forEach((item) => {
        if (item.status === 'PAID') {
          totalIncome += item.amount;
        } else if (
          ['ACCEPTED', 'COMPLETED', 'REFUNDED'].includes(item.status)
        ) {
          totalExpense += item.amount;
        }
      });

      items.sort((a, b) => b.time.localeCompare(a.time));

      return {
        date: format(new Date(dateKey), 'MM/dd (EEE)', { locale: ko }),
        totalIncome,
        totalExpense,
        totalAmount: totalIncome - totalExpense,
        details: items,
      };
    });

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }
}
