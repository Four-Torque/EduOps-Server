import { Injectable } from '@nestjs/common';
import { StaffAttendanceRepository } from '../repository/staff_attendance.repository';
import { StaffAttendanceResponse } from '../response/staff-attendance.response';
import { ApiException, ErrorCode } from 'src/global';
import { CreateStaffAttendanceRequest } from '../request/create-staff-attendance.request';

@Injectable()
export class StaffAttendanceService {
  constructor(
    private readonly staffAttendanceRepository: StaffAttendanceRepository,
  ) {}

  async getStaffAttendance(
    userId: string,
    workDate?: string,
  ): Promise<StaffAttendanceResponse[]> {
    if (workDate && isNaN(new Date(workDate).getTime())) {
      throw new ApiException(ErrorCode.BAD_REQUEST);
    }

    const attendance = await this.staffAttendanceRepository.findByUserId(
      userId,
      workDate,
    );
    const response: StaffAttendanceResponse[] = attendance.map((att) =>
      StaffAttendanceResponse.fromEntity(att),
    );

    return response;
  }

  async checkIn(
    createStaffAttendanceRequest: CreateStaffAttendanceRequest,
  ): Promise<StaffAttendanceResponse> {
    try {
      const { userId, workDate } = createStaffAttendanceRequest;
      const today = new Date();
      const date = workDate ? workDate : today.toISOString().split('T')[0];

      const existing = await this.staffAttendanceRepository.findByUserId(
        userId,
        date,
      );
      if (existing.length > 0) {
        throw new ApiException(ErrorCode.ATTENDANCE_ALREADY_EXISTS);
      }

      const data = CreateStaffAttendanceRequest.toEntity({
        userId,
        workDate: date,
        checkInTime: today,
      });
      const attendance =
        await this.staffAttendanceRepository.createAttendance(data);

      const response: StaffAttendanceResponse =
        StaffAttendanceResponse.fromEntity(attendance);
      return response;
    } catch (error: any) {
      if (error.code === 'P2025')
        throw new ApiException(ErrorCode.USER_NOT_FOUND);
      throw new ApiException(ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  async checkOut(id: string): Promise<StaffAttendanceResponse> {
    const attendance = await this.staffAttendanceRepository.findById(id);
    if (!attendance) {
      throw new ApiException(ErrorCode.ATTENDANCE_NOT_FOUND);
    }
    if (attendance.checkOutTime) {
      throw new ApiException(ErrorCode.ATTENDANCE_ALREADY_CHECKED_OUT);
    }

    const updatedAttendance = await this.staffAttendanceRepository.checkOut(id);
    const response: StaffAttendanceResponse =
      StaffAttendanceResponse.fromEntity(updatedAttendance);
    return response;
  }
}
