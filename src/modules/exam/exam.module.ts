import { Module } from '@nestjs/common';
import { ExamController } from './controller/exam.controller';
import { ExamService } from './service/exam.service';
import { ExamRepository } from './repository/exam.repository';
import { ExamResultRepository } from './repository/exam-result.repository';
import { ClassModule } from '../class/class.module';

@Module({
  imports: [ClassModule],
  controllers: [ExamController],
  providers: [ExamService, ExamRepository, ExamResultRepository],
  exports: [ExamService],
})
export class ExamModule {}
