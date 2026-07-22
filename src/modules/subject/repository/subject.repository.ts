import { Injectable } from '@nestjs/common';
import { Prisma, Subject } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: string): Promise<Subject | null> {
    return this.prisma.subject.findUnique({
      where: { name },
    });
  }

  async create(name: string): Promise<Subject> {
    return this.prisma.subject.create({
      data: { name },
    });
  }

  async findAll(search?: string) {
    const where: Prisma.SubjectWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    return this.prisma.subject.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
