import { Injectable } from '@nestjs/common';
import { StaffAttendanceRepository } from '../repository/staff-attendance.repository';
import { StaffAttendanceResponse } from '../response/staff-attendance.response';
import { ApiException, ErrorCode, formatDate } from 'src/global';
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

  private checkIsLate(checkInTime: string | Date | undefined | null): boolean {
    if (!checkInTime) return false;
    const checkIn = new Date(checkInTime);
    const checkInHour = checkIn.getHours();
    const checkInMin = checkIn.getMinutes();
    return checkInHour > 9 || (checkInHour === 9 && checkInMin > 0);
  }

  async checkIn(
    createStaffAttendanceRequest: CreateStaffAttendanceRequest,
    userId: string,
  ): Promise<StaffAttendanceResponse> {
    try {
      const { workDate } = createStaffAttendanceRequest;
      const today = new Date();
      const localDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const date = workDate ? workDate : localDateStr;

      const existing = await this.staffAttendanceRepository.findByUserId(
        userId,
        date,
      );
      if (existing.length > 0) {
        throw new ApiException(ErrorCode.ATTENDANCE_ALREADY_EXISTS);
      }

      const data = CreateStaffAttendanceRequest.toEntity(userId, {
        workDate: date,
        checkInTime: today,
      });
      const attendance = await this.staffAttendanceRepository.create(data);

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

  async checkOutByUserId(
    request: CreateStaffAttendanceRequest,
  ): Promise<StaffAttendanceResponse> {
    const { userId, workDate } = request;
    const formatWorkDate = formatDate(workDate);
    const existing = await this.staffAttendanceRepository.findByUserId(
      userId,
      formatWorkDate,
    );
    if (existing.length === 0) {
      throw new ApiException(ErrorCode.ATTENDANCE_NOT_FOUND);
    }
    const attendance = existing[0];
    if (attendance.checkOutTime) {
      throw new ApiException(ErrorCode.ATTENDANCE_ALREADY_CHECKED_OUT);
    }

    const updatedAttendance = await this.staffAttendanceRepository.checkOut(
      attendance.id,
    );
    const response: StaffAttendanceResponse =
      StaffAttendanceResponse.fromEntity(updatedAttendance);
    return response;
  }

  async getWeeklySummary(
    weekStart?: string,
    department?: string,
    search?: string,
  ) {
    if (weekStart && isNaN(new Date(weekStart).getTime())) {
      throw new ApiException(ErrorCode.BAD_REQUEST);
    }

    const baseDate = weekStart ? new Date(weekStart) : new Date();
    const currentDay = baseDate.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + diffToMonday);

    const dates: string[] = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return formatDate(d);
    });

    const { users, attendances } =
      await this.staffAttendanceRepository.findWeeklyAttendance(
        department,
        search,
        dates,
      );

    const todayStr = formatDate(new Date());

    const attendanceMap = new Map<string, any>();
    attendances.forEach((att) => {
      attendanceMap.set(`${att.userId}:${att.workDate}`, att);
    });

    const days = ['월', '화', '수', '목', '금'];
    let presentToday = 0;
    let absentToday = 0;
    let lateOrEtc = 0;

    const items = users.map((user) => {
      const weeklyAttendance = days.map((dayLabel, idx) => {
        const dateStr = dates[idx];
        const record = attendanceMap.get(`${user.id}:${dateStr}`);

        if (record) {
          const isLate = this.checkIsLate(record.checkInTime);
          return {
            day: dayLabel,
            status: isLate ? 'late' : 'present',
            checkedOut: !!record.checkOutTime,
          };
        }

        let status = 'pending';
        if (dateStr < todayStr) {
          status = 'absent';
        }

        return { day: dayLabel, status };
      });

      const todayRecord = attendanceMap.get(`${user.id}:${todayStr}`);
      if (dates.includes(todayStr)) {
        if (todayRecord) {
          this.checkIsLate(todayRecord.checkInTime)
            ? lateOrEtc++
            : presentToday++;
        } else {
          absentToday++;
        }
      }

      return {
        id: user.id,
        name: user.name,
        avatarInitial: user.name.charAt(0),
        department: user.role === 'TEACHER' ? '강사' : '관리자',
        weeklyAttendance,
      };
    });

    return {
      items,
      stats: {
        totalEmployees: users.length,
        presentToday,
        absentToday,
        lateOrEtc,
      },
    };
  }
}
