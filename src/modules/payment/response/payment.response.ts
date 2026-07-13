import { ApiProperty } from '@nestjs/swagger';
import { Payment, PaymentType } from '@prisma/client';

export class PaymentResponse {
  @ApiProperty({
    description: '결제/청구 ID',
    example: 'payment-uuid',
  })
  id: string;

  @ApiProperty({
    description: '강좌 ID',
    example: 'class-uuid',
  })
  classId: string;

  @ApiProperty({
    description: '학생 ID',
    example: 'student-uuid',
  })
  studentId: string;

  @ApiProperty({
    description: '청구 제목',
    example: '11월 기초수학 수강료',
  })
  title: string;

  @ApiProperty({
    description: '청구 금액',
    example: 150000,
  })
  amount: number;

  @ApiProperty({
    description: '결제 상태',
    enum: PaymentType,
    example: PaymentType.UNPAID,
  })
  paymentType: PaymentType;

  @ApiProperty({
    description: '실제 결제/환불 처리 일시',
    example: '2023-11-01T15:30:00.000Z',
    required: false,
    nullable: true,
  })
  paymentDate: Date | null;

  @ApiProperty({
    description: '납부 기한',
    example: '2023-11-30T23:59:59.000Z',
  })
  dueDate: Date;

  @ApiProperty({
    description: '생성 일시',
    example: '2023-10-31T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 일시',
    example: '2023-10-31T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '학생 이름',
    example: '홍길동',
    required: false,
  })
  studentName?: string;

  @ApiProperty({
    description: '강좌 이름',
    example: '수학영재반',
    required: false,
  })
  className?: string;

  static fromEntity(
    entity: Payment & { student?: { name: string }; class?: { name: string } },
  ): PaymentResponse {
    const response = new PaymentResponse();
    response.id = entity.id;
    response.classId = entity.classId;
    response.studentId = entity.studentId;
    response.title = entity.title;
    response.amount = entity.amount;
    response.paymentType = entity.paymentType;
    response.paymentDate = entity.paymentDate;
    response.dueDate = entity.dueDate;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;

    if (entity.student) {
      response.studentName = entity.student.name;
    }
    if (entity.class) {
      response.className = entity.class.name;
    }

    return response;
  }
}
