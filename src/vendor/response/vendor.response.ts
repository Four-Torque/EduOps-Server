import { Vendor } from '@prisma/client';

export class VendorResponse {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: Date;
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
