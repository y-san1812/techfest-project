import { prisma } from '@core/prisma';


export async function getDashboardSummary() {
  const [totalUsers, totalEvents, totalTasks] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.task.count(),
  ]);

  return {
    totalUsers,
    totalEvents,
    totalTasks,
    totalRegistrations: 0,
    totalRevenue: 0,
    eventStats: [],
    volunteerTasks: [],
  };
}

export async function exportRegistrationsCsv() {
  // Since you don't have registrations yet
  return 'No registrations available';
}