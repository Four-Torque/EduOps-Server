import { Module } from '@nestjs/common';
import { StudentService } from './service/student.service';
import { StudentController } from './controller/student.controller';
import { StudentRepository } from './repository/student.repository';

@Module({
  controllers: [StudentController],
  providers: [StudentService, StudentRepository],
  exports: [StudentService, StudentRepository],
})
export class StudentModule {}
