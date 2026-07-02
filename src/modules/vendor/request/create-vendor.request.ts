import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVendorRequest {
  @ApiProperty({
    description: '구매처 이름',
    example: 'ABC Company',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '구매처 전화번호',
    example: '010-1234-5678',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: '구매처 이메일',
    example: 'example@abc.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  static toEntity(request: CreateVendorRequest): Prisma.VendorCreateInput {
    return {
      name: request.name,
      phone: request.phone,
      email: request.email,
    };
  }
}
