import { Module } from '@nestjs/common';
import { SubjectService } from './service/subject.service';
import { SubjectController } from './controller/subject.controller';
import { SubjectRepository } from './repository/subject.repository';

@Module({
  controllers: [SubjectController],
  providers: [SubjectService, SubjectRepository],
  exports: [SubjectService, SubjectRepository],
})
export class SubjectModule {}
