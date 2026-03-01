import { prisma } from '@core/prisma';

export async function logActivity(userId: string | null, action: string, metadata?: unknown) {
  await prisma.activityLog.create({
    data: {
      userId: userId ?? undefined,
      action,
      metadata: metadata as any,
    },
  });
}

