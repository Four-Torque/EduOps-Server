import { SetMetadata } from '@nestjs/common';
import { Role as Roles } from '@prisma/client';

export const Role = (...roles: Roles[]) => SetMetadata('roles', roles);
