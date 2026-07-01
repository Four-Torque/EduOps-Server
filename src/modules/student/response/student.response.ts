import { ApiProperty } from '@nestjs/swagger';
import { Student, StudentStatus } from '@prisma/client';

export class StudentResponse {
  @ApiProperty({
    description: '학생 ID',
    example: 'student-uuid',
  })
  id: string;

  @ApiProperty({
    description: '학생 이름',
    example: '사나이',
  })
  name: string;

  @ApiProperty({
    description: '학생 전화번호',
    example: '010-1234-5678',
  })
  phone: string;

  @ApiProperty({
    description: '학생 상태',
    example: StudentStatus.ENROLLED,
  })
  status: StudentStatus;

  @ApiProperty({
    description: '학생 생년월일',
    example: '1950-01-01',
  })
  birth: string;

  @ApiProperty({
    description: '학생 주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  address: string;

  static fromEntity(entity: Student): StudentResponse {
    const response = new StudentResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.phone = entity.phone;
    response.status = entity.status;
    response.birth = entity.birth;
    response.address = entity.address;
    return response;
  }
}
