import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from '@prisma/client';

export class VendorResponse {
  @ApiProperty({ description: '구매처 ID', example: 'uuid' })
  id: string;
  @ApiProperty({ description: '구매처 이름', example: 'ABC Company' })
  name: string;
  @ApiProperty({ description: '구매처 전화번호', example: '010-1234-5678' })
  phone: string;
  @ApiProperty({ description: '구매처 이메일', example: 'example@abc.com' })
  email: string;
  @ApiProperty({ description: '생성일', example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;
  @ApiProperty({ description: '수정일', example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;

  static fromEntity(entity: Vendor): VendorResponse {
    const response = new VendorResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.phone = entity.phone;
    response.email = entity.email;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
