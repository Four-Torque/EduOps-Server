import { Module } from '@nestjs/common';
import { ScheduleController } from './controller/schedule.controller';
import { ScheduleService } from './service/schedule.service';
import { ScheduleRepository } from './repository/schedule.repository';
import { ClassModule } from '../class/class.module';

@Module({
  imports: [ClassModule],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleRepository],
  exports: [ScheduleService, ScheduleRepository],
})
export class ScheduleModule {}
