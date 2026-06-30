import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { StaffAttendanceController } from './controller/staff_attendance.controller';
import { StaffAttendanceService } from './service/staff_attendance.service';
import { StaffAttendanceRepository } from './repository/staff_attendance.repository';

@Module({
  imports: [UserModule],
  controllers: [StaffAttendanceController],
  providers: [StaffAttendanceService, StaffAttendanceRepository],
  exports: [StaffAttendanceService, StaffAttendanceRepository],
})
export class StaffAttendanceModule {}
