import { Injectable } from '@nestjs/common';
import { SalaryRepository } from '../repository/salary.repository';
import { SalaryStatus } from '@prisma/client';
import { SalaryResponse } from '../response/salary.response';
import { CreateSalaryRequest } from '../request/create-salary.request';
import { UserService } from 'src/modules/user/service/user.service';
import { ApiException, ErrorCode } from 'src/global';

@Injectable()
export class SalaryService {
  constructor(
    private readonly salaryRepository: SalaryRepository,
    private readonly userService: UserService,
  ) {}

  async createSalary(
    createSalaryRequest: CreateSalaryRequest,
  ): Promise<SalaryResponse> {
    const existUser = await this.userService.findById(
      createSalaryRequest.userId,
    );
    if (!existUser) {
      throw new ApiException(ErrorCode.USER_NOT_FOUND);
    }

    const salaryData = CreateSalaryRequest.toEntity(createSalaryRequest);

    const response: SalaryResponse =
      await this.salaryRepository.createSalary(salaryData);
    return response;
  }

  async getSalary(
    userId: string,
    status?: SalaryStatus,
  ): Promise<SalaryResponse[]> {
    const salaries = await this.salaryRepository.findByuserId(userId, status);
    const response: SalaryResponse[] = salaries.map((salary) =>
      SalaryResponse.fromEntity(salary),
    );
    return response;
  }
}
