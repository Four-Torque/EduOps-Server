import { Body, Controller, Post } from '@nestjs/common';
import { StaffAttendanceService } from '../service/staff_attendance.service';

@Controller('staff-attendance')
export class StaffAttendanceController {
  constructor(
    private readonly staffAttendanceService: StaffAttendanceService,
  ) {}
}
