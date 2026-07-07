import { Injectable } from '@nestjs/common';
import { Prisma, ClassFile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClassFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ClassFileCreateInput): Promise<ClassFile> {
    return this.prisma.classFile.create({ data });
  }

  async findByClassId(classId: string): Promise<ClassFile[]> {
    return this.prisma.classFile.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: { name: true },
        },
      },
    });
  }

  async findById(id: string): Promise<ClassFile | null> {
    return this.prisma.classFile.findUnique({
      where: { id },
    });
  }

  async delete(id: string): Promise<ClassFile> {
    return this.prisma.classFile.delete({
      where: { id },
    });
  }
}
