import { Salary, SalaryStatus } from '@prisma/client';

export class SalaryResponse {
  id: string;
  baseSalary: number;
  bonus: number;
  status: SalaryStatus;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: Salary): SalaryResponse {
    const response = new SalaryResponse();
    response.id = entity.id;
    response.baseSalary = entity.baseSalary;
    response.bonus = entity.bonus;
    response.status = entity.status;
    response.paymentDate = entity.paymentDate;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
