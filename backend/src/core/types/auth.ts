import { ROLE, RoleValue } from '@config/roles';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: RoleValue[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: RoleValue[];
}

export const DEFAULT_ROLES_FOR_REGULAR_USER: RoleValue[] = [ROLE.VOLUNTEER];

