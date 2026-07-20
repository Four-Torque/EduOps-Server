import { Injectable } from '@nestjs/common';
import { Prisma, Role, User, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async resetPassword(data: Prisma.UserUpdateArgs) {
    return this.prisma.user.update(data);
  }

  async findList(
    search: string,
    role: Role,
    status: UserStatus,
    skip: number,
    take: number,
    isApproved: string,
  ): Promise<User[]> {
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (role) {
      where.role = role;
    }
    if (status) {
      where.status = status;
    }

    if (isApproved !== undefined) {
      where.isApproved = isApproved === 'true';
    }

    return this.prisma.user.findMany({ where, skip, take });
  }

  async countList(
    search: string,
    role: Role,
    status: UserStatus,
    isApproved: string,
  ): Promise<number> {
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (role) {
      where.role = role;
    }
    if (status) {
      where.status = status;
    }

    if (isApproved !== undefined) {
      where.isApproved = isApproved === 'true';
    }

    return this.prisma.user.count({ where });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { status: UserStatus.ACTIVE },
    });
  }

  async findActiveUsersExcludingId(excludeId: string, name?: string): Promise<User[]> {
    const where: Prisma.UserWhereInput = {
      id: { not: excludeId },
      status: UserStatus.ACTIVE,
    };

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    return this.prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }
}
