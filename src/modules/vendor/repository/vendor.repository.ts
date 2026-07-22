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
    search?: string,
  ): Promise<Prisma.VendorGetPayload<{}>[]> {
    const where: Prisma.VendorWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    return this.prisma.vendor.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
    });
  }

  count(search?: string): Promise<number> {
    const where: Prisma.VendorWhereInput = {};
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    return this.prisma.vendor.count({
      where,
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

  async findByIds(ids: string[]): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
