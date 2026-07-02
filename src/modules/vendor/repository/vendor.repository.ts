import { Injectable } from '@nestjs/common';
import { Prisma, Vendor } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VendorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.VendorCreateInput) {
    return await this.prisma.vendor.create({
      data,
    });
  }

  async findAll(
    take: number,
    skip: number,
  ): Promise<Prisma.VendorGetPayload<{}>[]> {
    return this.prisma.vendor.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
    });
  }

  count(take: number, skip: number): Promise<number> {
    return this.prisma.vendor.count({
      skip,
      take,
    });
  }

  async findById(id: string): Promise<Vendor | null> {
    return this.prisma.vendor.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.VendorUpdateInput): Promise<Vendor> {
    return this.prisma.vendor.update({
      where: { id },
      data,
    });
  }

  async delete(ids: string[]): Promise<Prisma.BatchPayload> {
    return this.prisma.vendor.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
