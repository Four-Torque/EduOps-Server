import { Module } from '@nestjs/common';
import { SalaryController } from './controller/salary.controller';
import { SalaryService } from './service/salary.service';
import { UserModule } from '../user/user.module';
import { SalaryRepository } from './repository/salary.repository';

@Module({
  imports: [UserModule],
  controllers: [SalaryController],
  providers: [SalaryService, SalaryRepository],
  exports: [SalaryService, SalaryRepository],
})
export class SalaryModule {}
