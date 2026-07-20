import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { StaffAttendanceController } from './controller/staff-attendance.controller';
import { StaffAttendanceService } from './service/staff-attendance.service';
import { StaffAttendanceRepository } from './repository/staff-attendance.repository';
import { StudentAttendanceController } from './controller/student-attendance.controller';
import { StudentAttendanceService } from './service/student-attendance.service';
import { StudentAttendanceRepository } from './repository/student-attendance.repository';

@Module({
  imports: [UserModule],
  controllers: [StaffAttendanceController, StudentAttendanceController],
  providers: [
    StaffAttendanceService,
    StaffAttendanceRepository,

    StudentAttendanceService,
    StudentAttendanceRepository,
  ],
  exports: [
    StaffAttendanceService,
    StaffAttendanceRepository,

    StudentAttendanceService,
    StudentAttendanceRepository,
  ],
})
export class StaffAttendanceModule {}
