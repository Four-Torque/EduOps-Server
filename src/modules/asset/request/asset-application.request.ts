import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AssetApplicationRequest {
  @IsString()
  @IsNotEmpty()
  categoryId: string;
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  reason: string;

  static toEntity(
    request: AssetApplicationRequest,
    userId: string,
  ): Prisma.AssetsApplicationCreateInput {
    return {
      name: request.name,
      quantity: request.quantity,
      price: request.price,
      reason: request.reason,
      user: {
        connect: {
          id: userId,
        },
      },
      category: {
        connect: {
          id: request.categoryId,
        },
      },

      vendor: {
        connect: {
          id: request.vendorId,
        },
      },
    };
  }
}
