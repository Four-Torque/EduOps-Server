import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SalaryRepository } from '../repository/salary.repository';
import { UserRepository } from '../../user/repository/user.repository';
import { SalaryStatus } from '@prisma/client';

@Injectable()
export class SalaryScheduler {
  private readonly logger = new Logger(SalaryScheduler.name);

  constructor(
    private readonly salaryRepository: SalaryRepository,
    private readonly userRepository: UserRepository, // UserService 대신 UserRepository 직접 사용
  ) {}

  // 매월 1일 자정(00:00)에 실행
  @Cron('0 0 1 * *')
  async generateMonthlySalaries() {
    this.logger.log('급여 대기(PENDING) 데이터 일괄 생성 스케줄러 시작...');

    try {
      const activeUsers = await this.userRepository.findActiveUsers();
      if (!activeUsers.length) {
        this.logger.log('활성 유저가 없습니다.');
        return;
      }

      const userIds = activeUsers.map(user => user.id);

      const now = new Date();
      // 이번 달 (중복 방지용)
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      // 저번 달 (기본급 복사용)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      // 이번 달 급여 데이터 조회 (이미 생성되었는지 확인)
      const thisMonthSalaries = await this.salaryRepository.findSalariesByMonthRange(
        userIds,
        startOfThisMonth,
        endOfThisMonth
      );
      const thisMonthSalaryUserIds = new Set(thisMonthSalaries.map(s => s.userId));

      // 저번 달 급여 데이터 일괄 조회 (기본급 복사용)
      const lastMonthSalaries = await this.salaryRepository.findSalariesByMonthRange(
        userIds,
        startOfLastMonth,
        endOfLastMonth
      );

      // 유저별 저번 달 기본급 매핑 (가장 최근 데이터가 최상단에 오도록 repository에서 orderBy desc 했음)
      const lastMonthBaseSalaryMap = new Map<string, number>();
      for (const salary of lastMonthSalaries) {
        if (!lastMonthBaseSalaryMap.has(salary.userId)) {
          lastMonthBaseSalaryMap.set(salary.userId, salary.baseSalary);
        }
      }

      const paymentDate = new Date(now.getFullYear(), now.getMonth(), 25);
      let createdCount = 0;

      for (const user of activeUsers) {
        // 중복 방지
        if (thisMonthSalaryUserIds.has(user.id)) {
          continue;
        }

        try {
          const baseSalary = lastMonthBaseSalaryMap.get(user.id) || 0;

          await this.salaryRepository.createSalary({
            user: { connect: { id: user.id } },
            baseSalary,
            bonus: 0,
            status: SalaryStatus.PENDING,
            paymentDate,
          });

          createdCount++;
        } catch (innerError) {
          // 특정 유저의 생성 실패가 전체 로직을 중단시키지 않도록 예외 처리
          this.logger.error(`유저(${user.id}) 급여 생성 중 오류 발생`, innerError);
        }
      }

      this.logger.log(`총 ${createdCount}건의 급여 데이터 생성 완료.`);
    } catch (error) {
      this.logger.error('급여 데이터 일괄 생성 중 치명적 오류 발생', error);
    }
  }
}
