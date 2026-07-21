import { Injectable } from '@nestjs/common';
import { StaffAttendanceRepository } from '../repository/staff-attendance.repository';
import { StaffAttendanceResponse } from '../response/staff-attendance.response';
import { ApiException, ErrorCode, formatDate } from 'src/global';
import { CreateStaffAttendanceRequest } from '../request/create-staff-attendance.request';
import { UpdateStaffAttendanceRequest } from '../request/update-staff-attendance.request';
import { isValid, parseISO } from 'date-fns';

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

    const checkIn =
      typeof checkInTime === 'string' ? parseISO(checkInTime) : checkInTime;
    if (!isValid(checkIn)) return false;

    const hourStr = formatDate(checkIn, 'HH');
    const minuteStr = formatDate(checkIn, 'mm');

    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    return hour > 9 || (hour === 9 && minute > 0);
  }

  async checkIn(
    request: CreateStaffAttendanceRequest,
  ): Promise<StaffAttendanceResponse> {
    const { checkInTime, userId, workDate } = request;
    const date = workDate ? formatDate(workDate) : formatDate(checkInTime);

    const existing = await this.staffAttendanceRepository.findByUserId(
      userId,
      date,
    );

    let attendance;
    if (existing.length > 0) {
      const data = UpdateStaffAttendanceRequest.toEntity({
        checkInTime,
        workDate,
        userId,
      });
      attendance = await this.staffAttendanceRepository.update(
        existing[0].id,
        data,
      );
    } else {
      const data = CreateStaffAttendanceRequest.toEntity(request);
      attendance = await this.staffAttendanceRepository.create(data);
    }

    const response: StaffAttendanceResponse =
      StaffAttendanceResponse.fromEntity(attendance);
    return response;
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
    request: UpdateStaffAttendanceRequest,
  ): Promise<StaffAttendanceResponse> {
    const { userId, workDate, checkOutTime } = request;
    const resolvedCheckOutTime = checkOutTime
      ? new Date(checkOutTime)
      : new Date();

    let attendance: any = null;

    if (workDate) {
      const dateStr = formatDate(workDate);
      const existing = await this.staffAttendanceRepository.findByUserId(
        userId,
        dateStr,
      );
      if (existing.length > 0) {
        attendance = existing[0];
      }
    } else {
      const unchecked =
        await this.staffAttendanceRepository.findLatestUncheckedOut(userId);
      if (unchecked) {
        const todayStr = formatDate(resolvedCheckOutTime);
        const yesterday = new Date(resolvedCheckOutTime);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);

        if (
          unchecked.workDate === todayStr ||
          unchecked.workDate === yesterdayStr
        ) {
          attendance = unchecked;
        }
      }

      if (!attendance) {
        const todayStr = formatDate(resolvedCheckOutTime);
        const existing = await this.staffAttendanceRepository.findByUserId(
          userId,
          todayStr,
        );
        if (existing.length > 0) {
          attendance = existing[0];
        }
      }
    }

    if (!attendance) {
      throw new ApiException(ErrorCode.ATTENDANCE_NOT_FOUND);
    }
    if (attendance.checkOutTime) {
      throw new ApiException(ErrorCode.ATTENDANCE_ALREADY_CHECKED_OUT);
    }

    const updatedAttendance = await this.staffAttendanceRepository.checkOut(
      attendance.id,
      resolvedCheckOutTime,
    );
    const response: StaffAttendanceResponse =
      StaffAttendanceResponse.fromEntity(updatedAttendance);
    return response;
  }

  async updateCheckIn(id: string, request: UpdateStaffAttendanceRequest) {
    const existing = await this.staffAttendanceRepository.findById(id);
    if (!existing) {
      throw new ApiException(ErrorCode.ATTENDANCE_NOT_FOUND);
    }
    const data = UpdateStaffAttendanceRequest.toEntity(request);
    const updatedAttendance = await this.staffAttendanceRepository.update(
      id,
      data,
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

    let kstDate: Date;
    if (weekStart) {
      kstDate = new Date(`${weekStart}T00:00:00`);
    } else {
      const kstISOString = new Date()
        .toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' })
        .replace(' ', 'T');
      kstDate = new Date(kstISOString);
    }

    const currentDay = kstDate.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(kstDate);
    monday.setDate(kstDate.getDate() + diffToMonday);

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
            checkInTime: record.checkInTime,
            checkOutTime: record.checkOutTime,
          };
        }

        let status = 'pending';
        if (dateStr < todayStr) {
          status = 'absent';
        }

        return {
          day: dayLabel,
          status,
          checkInTime: null,
          checkOutTime: null,
        };
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
