import { prisma } from '@core/prisma';
import { sendEmail } from './email.service';

interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      body: input.body,
    },
  });

  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (user) {
    void sendEmail(user.email, input.title, input.body);
  }

  return notification;
}

export async function listUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function createAnnouncementForRole(roleName: string, title: string, body: string) {
  const users = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: {
            name: roleName,
          },
        },
      },
    },
  });

  await Promise.all(
    users.map((user) =>
      createNotification({
        userId: user.id,
        title,
        body,
      }),
    ),
  );
}

