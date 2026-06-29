import { Injectable } from '@nestjs/common';
import { StaffAttendanceRepository } from '../repository/staff_attendance.repository';

@Injectable()
export class StaffAttendanceService {
  constructor(
    private readonly staffAttendanceRepository: StaffAttendanceRepository,
  ) {}
}
