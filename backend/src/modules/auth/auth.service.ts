import * as bcrypt from 'bcryptjs';

import { ROLE } from '@config/roles';
import type { AuthUser } from '@core/types/auth';
import { prisma } from '@core/prisma';
import { signJwt } from '@utils/jwt';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    const error = new Error('Email already in use') as Error & { statusCode?: number };
    error.statusCode = 409;
    throw error;
  }

  const hashed = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: hashed,
    },
  });

  const volunteerRole = await prisma.role.findUnique({ where: { name: ROLE.VOLUNTEER } });
  if (volunteerRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: volunteerRole.id,
      },
    });
  }

  const roles = await prisma.userRole.findMany({
    where: { userId: user.id },
    include: { role: true },
  });

  const roleNames = roles.map((r) => r.role.name);

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: roleNames as any,
  };

  const token = signJwt({
    sub: user.id,
    email: user.email,
    roles: authUser.roles,
  });

  return { user: authUser, token };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    const error = new Error('Invalid credentials') as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    const error = new Error('Invalid credentials') as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }

  const roles = await prisma.userRole.findMany({
    where: { userId: user.id },
    include: { role: true },
  });

  const roleNames = roles.map((r) => r.role.name);

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: roleNames as any,
  };

  const token = signJwt({
    sub: user.id,
    email: user.email,
    roles: authUser.roles,
  });

  return { user: authUser, token };
}

