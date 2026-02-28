import type { RoleValue } from '@config/roles';
import type { AuthUser } from '@core/types/auth';
import { prisma } from '@core/prisma';

export async function getAuthUserFromDb(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      roles: {
        select: {
          role: { select: { name: true } },
        },
      },
    },
  });

  if (!user) return null;

  const roles = user.roles.map((r) => r.role.name) as RoleValue[];

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles,
  };
}

