import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVendorRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

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
