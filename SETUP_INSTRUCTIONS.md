# EventFlow Hub - Setup Instructions

## Complete System Overview

Your application now has the following structure:

### Database Schema
- **User**: System users with roles and permissions
- **Club**: Groups that organize events
- **Event**: Events belonging to clubs with faculty coordinators
- **Team**: Teams within events, led by team leads
- **TeamJoinRequest**: Volunteers requesting to join teams (approved by faculty coordinators)
- **Task**: Tasks assigned to teams
- **TaskAssignment**: Many-to-many relationship between tasks and users
- **EventFacultyCoordinator**: Faculty coordinators assigned to events to track progress

### Roles & Permissions
- **SUPER_ADMIN**: Full system access
- **ADMIN**: Create/edit/delete events, assign roles, manage clubs
- **FACULTY_COORDINATOR**: Assigned to events to approve team join requests and track team progress
- **CLUB_COORDINATOR**: Manage events within their club
- **TEAM_LEAD**: Create tasks, assign volunteers, manage team members
- **VOLUNTEER**: Join teams, complete tasks

---

## Step-by-Step Setup

### Step 1: Set Up Environment Variables

**In `/backend/.env`:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/eventflow"
JWT_SECRET="your-secret-key-here"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
```

**In `/eventflow-hub-main/.env.local`:**
```
VITE_API_URL=http://localhost:3000/api
```

### Step 2: Run Database Migration

```bash
cd backend

# Install dependencies (if not done)
npm install

# Run the migration to create tables and add new models
npx prisma migrate dev --name update_schema

# Optional: Seed initial data (create initial clubs)
npx prisma db seed
```

This will:
- Drop the old `Registration` table
- Create `Club`, `EventFacultyCoordinator`, `TeamJoinRequest`, and `TaskAssignment` tables
- Add `clubId` field to `Event` table
- Update `Task` table to remove old fields

### Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

The backend will be running on `http://localhost:3000`

### Step 4: Start Frontend Development Server

In a new terminal:
```bash
cd eventflow-hub-main
npm install  # if not done
npm run dev
```

The frontend will be running on `http://localhost:5173`

---

## Features Implemented

### Admin Dashboard (`/users`)
- View all users in the system
- Assign/revoke roles to any user
- Search and filter users

### Teams Management (`/teams`)
- View all events and their teams
- See team members and details
- Request to join teams (VOLUNTEER/TEAM_LEAD)
- Approve/reject team join requests (FACULTY_COORDINATOR)

### Events Management (`/events`)
- Create new events with **Club selection** (required field)
- View all events
- Edit/delete events (ADMIN/SUPER_ADMIN only)
- Status tracking (DRAFT, PUBLISHED, CLOSED)

### Backend APIs

**Clubs API:**
- `GET /api/clubs` - List all clubs
- `POST /api/clubs` - Create club (ADMIN)
- `PUT /api/clubs/:id` - Update club (ADMIN)
- `DELETE /api/clubs/:id` - Delete club (ADMIN)

**Teams API:**
- `GET /api/teams/event/:eventId` - Get teams by event
- `GET /api/teams/:id` - Get team details
- `POST /api/teams/:teamId/join` - Request to join team
- `POST /api/teams/requests/:requestId/approve` - Approve join request (FACULTY)
- `POST /api/teams/requests/:requestId/reject` - Reject join request (FACULTY)
- `GET /api/teams/:id/join-requests` - Get pending join requests

**Faculty Coordinator API:**
- `GET /api/faculty/event/:eventId` - Get faculty coordinators for event
- `POST /api/faculty/assign` - Assign faculty coordinator (ADMIN)
- `DELETE /api/faculty/:eventId/:userId` - Remove faculty coordinator (ADMIN)
- `GET /api/faculty/my-events` - Get events where user is faculty

**Tasks API:**
- `GET /api/tasks/my` - Get user's assigned tasks
- `POST /api/tasks` - Create task (TEAM_LEAD)
- `POST /api/tasks/:taskId/assign` - Assign task to user
- `DELETE /api/tasks/:taskId/assign/:userId` - Unassign task
- `GET /api/tasks/team/:teamId` - Get team's tasks

**Admin Users API:**
- `GET /api/admin/users` - List all users
- `GET /api/admin/roles` - List all roles
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/:id/roles` - Set user roles
- `DELETE /api/admin/users/:id` - Delete user

---

## Data Flow

### Volunteer Joining a Team
1. Volunteer views Teams page (`/teams`)
2. Selects event → views teams
3. Clicks "Request to Join" on a team
4. Request sent → stored in `TeamJoinRequest` (PENDING)
5. Faculty coordinator sees pending requests
6. Faculty approves → user added to `TeamMember` table
7. Volunteer is now a team member

### Team Lead Assigning Tasks
1. Team lead creates task in team
2. Task assigned to multiple volunteers via `TaskAssignment` table
3. Each assignment has independent status (TODO, IN_PROGRESS, COMPLETED)
4. Volunteers update their own assignment status

### Faculty Coordinator Tracking Progress
1. Admin assigns faculty coordinator to event
2. Faculty coordinator views assigned event's teams
3. Can see all team members and their task progress
4. Can approve/reject team join requests

---

## API Authorization

All authenticated endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

Token obtained from:
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new account

---

## Troubleshooting

### Database Issues
If you get errors about tables not existing:
```bash
cd backend
npx prisma migrate dev --name fix_schema
```

### Port Already in Use
Change ports in:
- Backend: Modify `PORT` in backend `src/main.ts`
- Frontend: `npm run dev -- --port 5174`

### API Connection Issues
Check `VITE_API_URL` in frontend `.env.local` matches your backend URL.

### Role Not Working
Ensure user has been assigned the role through the Users Management page (`/users`)

---

## Next Steps

1. Create initial clubs through the API or database
2. Assign ADMIN role to a user for full access
3. Admin can then create events (selecting clubs)
4. Create teams within events
5. Assign faculty coordinators to events
6. Volunteers can request to join teams

