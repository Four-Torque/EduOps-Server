import { Module } from '@nestjs/common';
import { ClassController } from './controller/class.controller';
import { ClassService } from './service/class.service';
import { ClassRepository } from './repository/class.repository';
import { SubjectModule } from '../subject/subject.module';

@Module({
  imports: [SubjectModule],
  controllers: [ClassController],
  providers: [ClassService, ClassRepository],
  exports: [ClassService, ClassRepository],
})
export class ClassModule {}
