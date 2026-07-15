import { ApiProperty } from '@nestjs/swagger';
import { AssetsApplication, Payment, Salary } from '@prisma/client';

export class UnifiedFinancialResponse {
  @ApiProperty({ description: '식별자 ID' })
  id: string;
  @ApiProperty({ description: '유형', example: 'INCOME | EXPENSE' })
  type: 'INCOME' | 'EXPENSE';
  @ApiProperty({ description: '날짜' })
  date: Date;
  @ApiProperty({ description: '항목 대분류 명칭' })
  itemTitle: string;
  @ApiProperty({ description: '항목 소분류 명칭' })
  itemSub: string;
  @ApiProperty({ description: '대상자 이름' })
  studentName: string;
  @ApiProperty({ description: '금액' })
  amount: number;
  @ApiProperty({ description: '상태 정보' })
  status: string;

  static fromPaymentEntity(
    entity: Payment & { class: { name: string }; student: { name: string } },
  ): UnifiedFinancialResponse {
    const response = new UnifiedFinancialResponse();
    response.id = entity.id;
    response.type = 'INCOME';
    response.date = entity.paymentDate ?? entity.createdAt;
    response.itemTitle = entity.title;
    response.itemSub = entity.class?.name || '일반 청구';
    response.studentName = entity.student?.name || '알 수 없음';
    response.amount = entity.amount;
    response.status = entity.paymentType;
    return response;
  }

  static fromSalaryEntity(
    entity: Salary & { user: { name: string } },
  ): UnifiedFinancialResponse {
    const res = new UnifiedFinancialResponse();
    res.id = entity.id;
    res.type = 'EXPENSE';
    res.date = entity.paymentDate ?? entity.createdAt;
    res.itemTitle = `강사 급여 지급 (${entity.user?.name || '강사'})`;
    res.itemSub = '급여';
    res.studentName = entity.user?.name || '알 수 없음';
    res.amount = entity.baseSalary + entity.bonus;
    res.status = entity.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING';
    return res;
  }

  static fromAssetEntity(
    entity: AssetsApplication & {
      user: { name: string };
    },
  ): UnifiedFinancialResponse {
    const res = new UnifiedFinancialResponse();
    res.id = entity.id;
    res.type = 'EXPENSE';
    res.date = entity.processedAt ?? entity.requestedAt;
    res.itemTitle = `${entity.name} 구매`;
    res.itemSub = '비품/자재';
    res.studentName = entity.user?.name || '행정원';
    res.amount = entity.price * entity.quantity;
    res.status = entity.status === 'ACCEPTED' ? 'COMPLETED' : 'PENDING';
    return res;
  }

  static toPaginated(
    page: number,
    total: number,
    totalPages: number,
    data: UnifiedFinancialResponse[],
  ) {
    return {
      page: Number(page),
      total,
      totalPages,
      data,
    };
  }
}
