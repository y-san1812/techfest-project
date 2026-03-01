import { prisma } from '../src/core/prisma';
import * as bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database with teams, roles, and tasks...');

  // First, get or create a club
  let club = await prisma.club.findFirst();
  if (!club) {
    club = await prisma.club.create({
      data: {
        name: 'Tech Club',
      },
    });
    console.log(`✓ Created club: ${club.name}`);
  }

  // Create sample events
  const eventTitles = ['TechFest 2024', 'Hackathon 2024', 'Web Dev Workshop'];
  const events = [];

  for (const title of eventTitles) {
    let event = await prisma.event.findFirst({ where: { title } });
    if (!event) {
      event = await prisma.event.create({
        data: {
          title,
          description: `Sample event: ${title}`,
          category: 'WORKSHOP',
          clubId: club.id,
          status: 'PUBLISHED',
          startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          location: 'Tech Building, Room 101',
          registrationCap: 50,
        },
      });
      console.log(`✓ Created event: ${event.title}`);
    }
    events.push(event);
  }

  // Create sample users with different roles
  const sampleUsers = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'ADMIN',
    },
    {
      name: 'Faculty Coordinator 1',
      email: 'faculty1@example.com',
      password: 'faculty123',
      role: 'FACULTY_COORDINATOR',
      eventId: events[0].id,
    },
    {
      name: 'Faculty Coordinator 2',
      email: 'faculty2@example.com',
      password: 'faculty123',
      role: 'FACULTY_COORDINATOR',
      eventId: events[1].id,
    },
    {
      name: 'Team Lead 1',
      email: 'teamlead1@example.com',
      password: 'lead1234',
      role: 'TEAM_LEAD',
    },
    {
      name: 'Team Lead 2',
      email: 'teamlead2@example.com',
      password: 'lead1234',
      role: 'TEAM_LEAD',
    },
    {
      name: 'Team Member 1',
      email: 'member1@example.com',
      password: 'member123',
      role: 'VOLUNTEER',
    },
    {
      name: 'Team Member 2',
      email: 'member2@example.com',
      password: 'member123',
      role: 'VOLUNTEER',
    },
    {
      name: 'Team Member 3',
      email: 'member3@example.com',
      password: 'member123',
      role: 'VOLUNTEER',
    },
  ];

  const createdUsers: any = {};

  for (const userData of sampleUsers) {
    let user = await prisma.user.findUnique({ where: { email: userData.email } });
    if (!user) {
      const hashed = await bcrypt.hash(userData.password, 10);
      user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashed,
        },
      });
      console.log(`✓ Created user: ${user.name} (${user.email})`);
    }
    createdUsers[userData.email] = { user, ...userData };
  }

  // Get or create roles
  const roleNames = ['ADMIN', 'FACULTY_COORDINATOR', 'TEAM_LEAD', 'VOLUNTEER'];
  const roles: any = {};

  for (const roleName of roleNames) {
    let role = await prisma.role.findFirst({ where: { name: roleName } });
    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleName,
          description: `${roleName} role`,
        },
      });
    }
    roles[roleName] = role;
  }

  // Assign roles to users
  for (const [email, userData] of Object.entries(createdUsers)) {
    const user = (userData as any).user;
    const roleName = (userData as any).role;

    // Remove existing roles
    await prisma.userRole.deleteMany({ where: { userId: user.id } });

    // Add new role
    const role = roles[roleName];
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      },
    });

    // Add contextual roles
    if (roleName === 'FACULTY_COORDINATOR' && (userData as any).eventId) {
      await prisma.facultyCoordinatorRole.upsert({
        where: { userId_eventId: { userId: user.id, eventId: (userData as any).eventId } },
        update: {},
        create: {
          userId: user.id,
          eventId: (userData as any).eventId,
        },
      });
      const event = events.find(e => e.id === (userData as any).eventId);
      console.log(`✓ Assigned ${user.name} as Faculty Coordinator for: ${event?.title}`);
    }
  }

  // Create sample teams for the first event
  const teamLeadUser1 = createdUsers['teamlead1@example.com'].user;
  const teamLeadUser2 = createdUsers['teamlead2@example.com'].user;
  const memberUser1 = createdUsers['member1@example.com'].user;
  const memberUser2 = createdUsers['member2@example.com'].user;
  const memberUser3 = createdUsers['member3@example.com'].user;

  let team1 = await prisma.team.findFirst({ where: { name: 'Team Alpha' } });
  if (!team1) {
    team1 = await prisma.team.create({
      data: {
        name: 'Team Alpha',
        eventId: events[0].id,
        teamLeadId: teamLeadUser1.id,
      },
    });
    console.log(`✓ Created team: ${team1.name}`);
  }

  let team2 = await prisma.team.findFirst({ where: { name: 'Team Beta' } });
  if (!team2) {
    team2 = await prisma.team.create({
      data: {
        name: 'Team Beta',
        eventId: events[0].id,
        teamLeadId: teamLeadUser2.id,
      },
    });
    console.log(`✓ Created team: ${team2.name}`);
  }

  // Add team members
  const existingMembersTeam1 = await prisma.teamMember.count({
    where: { teamId: team1.id },
  });

  if (existingMembersTeam1 === 0) {
    await prisma.teamMember.createMany({
      data: [
        { teamId: team1.id, userId: memberUser1.id },
        { teamId: team1.id, userId: memberUser2.id },
      ],
    });
    console.log(`✓ Added members to ${team1.name}`);
  }

  const existingMembersTeam2 = await prisma.teamMember.count({
    where: { teamId: team2.id },
  });

  if (existingMembersTeam2 === 0) {
    await prisma.teamMember.createMany({
      data: [{ teamId: team2.id, userId: memberUser3.id }],
    });
    console.log(`✓ Added members to ${team2.name}`);
  }

  // Assign team lead roles
  await prisma.teamLeadRole.upsert({
    where: { userId_teamId: { userId: teamLeadUser1.id, teamId: team1.id } },
    update: {},
    create: { userId: teamLeadUser1.id, teamId: team1.id },
  });

  await prisma.teamLeadRole.upsert({
    where: { userId_teamId: { userId: teamLeadUser2.id, teamId: team2.id } },
    update: {},
    create: { userId: teamLeadUser2.id, teamId: team2.id },
  });

  console.log(`✓ Assigned team lead roles`);

  // Create sample tasks for teams
  const existingTasksTeam1 = await prisma.task.count({ where: { teamId: team1.id } });

  if (existingTasksTeam1 === 0) {
    const task1 = await prisma.task.create({
      data: {
        title: 'Setup Project Repository',
        description: 'Initialize git repository and set up GitHub project',
        teamId: team1.id,
      },
    });

    const task2 = await prisma.task.create({
      data: {
        title: 'Design UI Mockups',
        description: 'Create wireframes and UI mockups using Figma',
        teamId: team1.id,
      },
    });

    const task3 = await prisma.task.create({
      data: {
        title: 'Frontend Development',
        description: 'Build the frontend components',
        teamId: team1.id,
      },
    });

    // Assign tasks to team members with different statuses
    await prisma.taskAssignment.createMany({
      data: [
        { taskId: task1.id, userId: memberUser1.id, status: 'COMPLETED' },
        { taskId: task2.id, userId: memberUser2.id, status: 'IN_PROGRESS' },
        { taskId: task3.id, userId: memberUser1.id, status: 'TODO' },
      ],
    });

    console.log(`✓ Created 3 sample tasks for Team Alpha`);
  }

  const existingTasksTeam2 = await prisma.task.count({ where: { teamId: team2.id } });

  if (existingTasksTeam2 === 0) {
    const task4 = await prisma.task.create({
      data: {
        title: 'Backend API Design',
        description: 'Design RESTful API endpoints',
        teamId: team2.id,
      },
    });

    const task5 = await prisma.task.create({
      data: {
        title: 'Database Schema',
        description: 'Create database schema and migrations',
        teamId: team2.id,
      },
    });

    // Assign tasks to team members with different statuses
    await prisma.taskAssignment.createMany({
      data: [
        { taskId: task4.id, userId: memberUser3.id, status: 'IN_PROGRESS' },
        { taskId: task5.id, userId: memberUser3.id, status: 'TODO' },
      ],
    });

    console.log(`✓ Created 2 sample tasks for Team Beta`);
  }

  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
