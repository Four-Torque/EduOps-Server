import { Module } from '@nestjs/common';
import { FinanceService } from './service/finance.service';
import { FinanceController } from './controller/finance.controller';
import { FinanceRepository } from './repository/finance.repository';
import { AssetModule } from '../asset/asset.module';
import { PaymentModule } from '../payment/payment.module';
import { SalaryModule } from '../salary/salary.module';

@Module({
  imports: [AssetModule, PaymentModule, SalaryModule],
  controllers: [FinanceController],
  providers: [FinanceService, FinanceRepository],
  exports: [FinanceService, FinanceRepository],
})
export class FinanceModule {}
