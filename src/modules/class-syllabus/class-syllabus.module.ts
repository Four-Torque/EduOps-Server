import { Module } from '@nestjs/common';
import { ClassSyllabusService } from './service/class-syllabus.service';
import { ClassSyllabusController } from './controller/class-syllabus.controller';
import { ClassSyllabusRepository } from './repository/class-syllabus.repository';

@Module({
  controllers: [ClassSyllabusController],
  providers: [ClassSyllabusService, ClassSyllabusRepository],
})
export class ClassSyllabusModule {}
