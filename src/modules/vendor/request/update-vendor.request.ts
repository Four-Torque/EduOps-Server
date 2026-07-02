import { PartialType } from '@nestjs/swagger';
import { CreateVendorRequest } from './create-vendor.request';
import { Prisma } from '@prisma/client';

export class UpdateVendorRequest extends PartialType(CreateVendorRequest) {
  static toEntity(request: UpdateVendorRequest): Prisma.VendorUpdateInput {
    return {
      ...request,
    };
  }
}
