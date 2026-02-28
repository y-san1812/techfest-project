import { prisma } from '@core/prisma';

export async function getDashboardSummary() {
  const [totalUsers, totalEvents, totalRegistrations, totalPayments] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.registration.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
  ]);

  const eventStats = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      _count: {
        select: { registrations: true },
      },
    },
  });

  const volunteerTasks = await prisma.task.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  return {
    totalUsers,
    totalEvents,
    totalRegistrations,
    totalRevenue: totalPayments._sum.amount ?? 0,
    eventStats,
    volunteerTasks,
  };
}

export async function exportRegistrationsCsv() {
  const registrations = await prisma.registration.findMany({
    include: {
      user: true,
      event: true,
      team: true,
      referral: true,
      payment: true,
    },
  });

  const header = [
    'RegistrationID',
    'UserEmail',
    'EventTitle',
    'TeamName',
    'Status',
    'ReferralCode',
    'PaymentStatus',
    'Amount',
    'CreatedAt',
  ];

  const rows = registrations.map((r) => [
    r.id,
    r.user.email,
    r.event.title,
    r.team?.name ?? '',
    r.status,
    r.referral?.code ?? '',
    r.payment?.status ?? '',
    r.payment?.amount?.toString() ?? '',
    r.createdAt.toISOString(),
  ]);

  return [header, ...rows]
    .map((cols) => cols.map((c) => `"${(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

