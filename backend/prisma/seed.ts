import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Create roles
  const roles = [
    'SUPER_ADMIN',
    'ADMIN',
    'FACULTY_COORDINATOR',
    'CLUB_COORDINATOR',
    'TEAM_LEAD',
    'VOLUNTEER',
    'CAMPUS_AMBASSADOR',
  ];

  await Promise.all(
    roles.map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  // 2️⃣ Define credentials for each role (except VOLUNTEER)
  const usersData = [
    {
      name: 'Super Admin',
      email: 'superadmin@techfest.local',
      password: 'superadm1n1812',
      roleName: 'SUPER_ADMIN',
    },
    {
      name: 'Admin User',
      email: 'admin@techfest.local',
      password: 'admin1234',
      roleName: 'ADMIN',
    },
    {
      name: 'Faculty Coordinator',
      email: 'faculty@techfest.local',
      password: 'faculty1234',
      roleName: 'FACULTY_COORDINATOR',
    },
    {
      name: 'Club Coordinator',
      email: 'club@techfest.local',
      password: 'club1234',
      roleName: 'CLUB_COORDINATOR',
    },
    {
      name: 'Team Lead',
      email: 'teamlead@techfest.local',
      password: 'teamlead1234',
      roleName: 'TEAM_LEAD',
    },
    {
      name: 'Campus Ambassador',
      email: 'ambassador@techfest.local',
      password: 'amba55ador1812',
      roleName: 'CAMPUS_AMBASSADOR',
    },
  ];

  // 3️⃣ Create users and assign roles
  for (const userData of usersData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { password: hashedPassword },
      create: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
      },
    });

    const role = await prisma.role.findUniqueOrThrow({
      where: { name: userData.roleName },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id,
      },
    });
  }

  // 4️⃣ Seed events (keep your original events)
  await prisma.event.createMany({
    data: [
      {
        title: 'Hackathon 2026',
        description: '24-hour coding marathon.',
        category: 'Coding',
        status: 'PUBLISHED',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        location: 'Main Auditorium',
        registrationCap: 200,
      },
      {
        title: 'Robotics Challenge',
        description: 'Build and compete with robots.',
        category: 'Robotics',
        status: 'DRAFT',
        startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        location: 'Lab Block',
        registrationCap: 50,
      },
    ],
    skipDuplicates: true,
  });

  // 5️⃣ Seed referral code for Campus Ambassador
  const ambassador = await prisma.user.findUniqueOrThrow({
    where: { email: 'ambassador@techfest.local' },
  });

  await prisma.referral.upsert({
    where: { code: 'AMBASSADOR2026' },
    update: {},
    create: {
      code: 'AMBASSADOR2026',
      ownerId: ambassador.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('User credentials:');
  usersData.forEach((user) => {
    console.log(`Role: ${user.roleName}`);
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log('---');
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });