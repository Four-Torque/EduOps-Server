import {
  AssetsApplication,
  Category,
  Class,
  Payment,
  Salary,
  Student,
  User,
} from '@prisma/client';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export class FinanceResponse {
  date: string;
  totalIncome: number;
  totalExpense: number;
  totalAmount: number;
  details: FinanceDetailResponse[];

  static fromDetails(date: string, details: FinanceDetailResponse[]) {
    const response = new FinanceResponse();
    response.date = date;
    response.details = details;
    response.totalIncome = details
      .filter((detail) => detail.type === 'INCOME')
      .reduce((sum, detail) => sum + detail.amount, 0);
    response.totalExpense = details
      .filter((detail) => detail.type === 'EXPENSE')
      .reduce((sum, detail) => sum + detail.amount, 0);
    response.totalAmount = response.totalIncome - response.totalExpense;
    return response;
  }
}

export class FinanceDetailResponse {
  id: string;
  date: string;
  time: string;
  type: 'EXPENSE' | 'INCOME';
  amount: number;
  category: 'ASSET' | 'SALARY' | 'ENROLLMENT_FEE';
  title: string;
  status: string;

  static fromAssetApplications(
    entity: AssetsApplication & { user: User; category: Category },
  ) {
    const response = new FinanceDetailResponse();
    response.id = entity.id;

    const expenseDate = entity.processedAt ?? entity.requestedAt;
    response.date = format(expenseDate, 'yyyy-MM-dd', { locale: ko });
    response.time = format(expenseDate, 'HH:mm', { locale: ko });
    response.type = 'EXPENSE';
    response.amount = entity.price * entity.quantity;
    response.category = 'ASSET';
    response.title = `[자재] ${entity.name} X ${entity.quantity}개 - ${entity.user.name}`;
    response.status = entity.status;
    return response;
  }

  static fromPayment(entity: Payment & { student: Student; class: Class }) {
    const response = new FinanceDetailResponse();
    response.id = entity.id;
    response.date = format(entity.paymentDate, 'yyyy-MM-dd', { locale: ko });
    response.time = format(entity.paymentDate, 'HH:mm', { locale: ko });
    response.type = 'INCOME';
    response.amount = entity.amount;
    response.category = 'ENROLLMENT_FEE';
    response.title = `[수강료] ${entity.student.name} - ${entity.class.name}`;
    response.status = entity.paymentType;
    return response;
  }

  static fromSalary(entity: Salary & { user: User }) {
    const response = new FinanceDetailResponse();
    response.id = entity.id;
    response.date = format(entity.paymentDate, 'yyyy-MM-dd', { locale: ko });
    response.time = format(entity.paymentDate, 'HH:mm', { locale: ko });
    response.type = 'EXPENSE';
    response.amount = entity.baseSalary + entity.bonus;
    response.category = 'SALARY';
    response.title = `[급여] ${entity.user.name}`;
    response.status = entity.status;
    return response;
  }
}
