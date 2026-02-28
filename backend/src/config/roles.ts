export const ROLE = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  FACULTY_COORDINATOR: 'FACULTY_COORDINATOR',
  CLUB_COORDINATOR: 'CLUB_COORDINATOR',
  TEAM_LEAD: 'TEAM_LEAD',
  VOLUNTEER: 'VOLUNTEER',
  CAMPUS_AMBASSADOR: 'CAMPUS_AMBASSADOR',
} as const;

export type RoleKey = keyof typeof ROLE;
export type RoleValue = (typeof ROLE)[RoleKey];

export const ALL_ROLES: RoleValue[] = Object.values(ROLE);

