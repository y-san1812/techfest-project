export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'FACULTY_COORDINATOR'
  | 'CLUB_COORDINATOR'
  | 'TEAM_LEAD'
  | 'VOLUNTEER'
  | 'CAMPUS_AMBASSADOR';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: Role[];
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
