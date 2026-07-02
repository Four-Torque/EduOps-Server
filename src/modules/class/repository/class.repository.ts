import { Injectable } from '@nestjs/common';
import { Class, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ClassCreateInput): Promise<Class> {
    return this.prisma.class.create({
      data: data,
    });
  }

  async findById(id: string): Promise<Class> {
    return this.prisma.class.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, data: Prisma.ClassUpdateInput): Promise<Class> {
    return this.prisma.class.update({
      where: { id },
      data,
    });
  }

  async findAll(
    name?: string,
    teacherId?: string,
    status?: any,
    skip?: number,
    take?: number,
  ): Promise<Class[]> {
    const where: Prisma.ClassWhereInput = {
      ...(name && { name: { contains: name } }),
      ...(teacherId && { teacherId }),
      ...(status && { status }),
    };

    return this.prisma.class.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(
    name?: string,
    teacherId?: string,
    status?: any,
  ): Promise<number> {
    const where: Prisma.ClassWhereInput = {
      ...(name && { name: { contains: name } }),
      ...(teacherId && { teacherId }),
      ...(status && { status }),
    };

    return this.prisma.class.count({
      where,
    });
  }
}
