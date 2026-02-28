import bcrypt from 'bcryptjs';

import { prisma } from '@core/prisma';

export async function listUsers(input: { q?: string; role?: string; take: number; skip: number }) {
  const where: any = {};
  if (input.q) {
    where.OR = [
      { email: { contains: input.q, mode: 'insensitive' } },
      { name: { contains: input.q, mode: 'insensitive' } },
    ];
  }
  if (input.role) {
    where.roles = {
      some: { role: { name: input.role } },
    };
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: input.take,
      skip: input.skip,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        roles: { select: { role: { select: { name: true } } } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    total,
    items: items.map((u) => ({
      ...u,
      roles: u.roles.map((r) => r.role.name),
    })),
  };
}

export async function createUserWithRoles(input: {
  name: string;
  email: string;
  password: string;
  roles: string[];
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    const error = new Error('Email already in use') as Error & { statusCode?: number };
    error.statusCode = 409;
    throw error;
  }

  const roleRecords = await prisma.role.findMany({ where: { name: { in: input.roles } } });
  if (roleRecords.length !== input.roles.length) {
    const error = new Error('One or more roles are invalid') as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  const hashed = await bcrypt.hash(input.password, 10);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashed,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    await tx.userRole.createMany({
      data: roleRecords.map((r) => ({ userId: user.id, roleId: r.id })),
      skipDuplicates: true,
    });

    // If Campus Ambassador, ensure a referral exists
    const isAmbassador = input.roles.includes('CAMPUS_AMBASSADOR');
    if (isAmbassador) {
      const base = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'AMB';
      const code = `${base.toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
      await tx.referral.create({
        data: {
          ownerId: user.id,
          code,
        },
      });
    }

    const roles = roleRecords.map((r) => r.name);
    return { ...user, roles };
  });
}

export async function setUserRoles(userId: string, roles: string[]) {
  const roleRecords = await prisma.role.findMany({ where: { name: { in: roles } } });
  if (roleRecords.length !== roles.length) {
    const error = new Error('One or more roles are invalid') as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId } });
    await tx.userRole.createMany({
      data: roleRecords.map((r) => ({ userId, roleId: r.id })),
      skipDuplicates: true,
    });

    const hasAmbassador = roles.includes('CAMPUS_AMBASSADOR');
    if (hasAmbassador) {
      const existingReferral = await tx.referral.findFirst({ where: { ownerId: userId } });
      if (!existingReferral) {
        const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });
        const base = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'AMB';
        const code = `${base.toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
        await tx.referral.create({
          data: {
            ownerId: userId,
            code,
          },
        });
      }
    }

    return { userId, roles };
  });
}

export async function deleteUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}

export async function listRoles() {
  return prisma.role.findMany({ orderBy: { name: 'asc' } });
}

