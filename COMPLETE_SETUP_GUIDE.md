# Complete Event Management System - Setup Guide

You've built a comprehensive event management system with role-based access control. Here's exactly how to run it:

## Database Setup

### Step 1: Apply All Migrations
```bash
cd backend
npx prisma migrate deploy
```

This will apply all three migrations in order:
- `20260227173946_init` - Initial schema with users, events, teams, tasks
- `20260228_update_schema` - Adds EventFacultyCoordinator, TeamJoinRequest, TaskAssignment, Club
- `20260301_add_club_coordinator` - Adds ClubCoordinator table

### Step 2: Verify Database (Optional)
```bash
npx prisma studio
```

This opens a GUI to view your database. You can manually add test clubs/events here if needed.

---

## System Architecture

### Database Models & Relationships

**Users & Roles:**
- User can have multiple roles (SUPER_ADMIN, ADMIN, CLUB_COORDINATOR, FACULTY_COORDINATOR, TEAM_LEAD, VOLUNTEER)
- Each role assignment can be linked to specific clubs, events, or teams

**Clubs → Events → Teams → Members:**
- Club contains many Events
- Event contains many Teams
- Team contains many TeamMembers and Tasks
- Club has Coordinators (ClubCoordinator table)
- Event has Faculty Coordinators (EventFacultyCoordinator table)

**Team Join Flow:**
- Volunteers request to join a team (TeamJoinRequest)
- Faculty coordinators approve/reject requests
- Approved requests add user to TeamMember

**Tasks & Work:**
- Team leads assign tasks to volunteers
- Multiple volunteers can be assigned to same task (TaskAssignment)
- Each assignment has individual status (TODO, IN_PROGRESS, COMPLETED)

---

## Role Breakdown & Permissions

### SUPER_ADMIN / ADMIN
✅ Access to all pages
✅ Create/Edit/Delete Events (with club selection)
✅ Create/Edit/Delete Clubs
✅ Manage Users (assign roles)
✅ Assign Club Coordinators (select specific club)
✅ Assign Faculty Coordinators (select specific event)
✅ Assign Team Leads (select specific team within event)
✅ View all reports

**Key Pages:** Dashboard, Users, Clubs, Events, Teams, Tasks, Reports

### CLUB_COORDINATOR
✅ View assigned club's events and teams
✅ Create teams (within their club's events)
✅ Manage team members
✅ View tasks for teams in their club

**Pages:** Clubs, Events, Teams, Tasks

### FACULTY_COORDINATOR
✅ View assigned event's teams
✅ See all team members and their progress
✅ Approve/Reject join requests for event's teams
✅ View team tasks and assignments

**Pages:** Teams, Events (of assigned events only)

### TEAM_LEAD
✅ Create tasks for their team
✅ Assign tasks to team members
✅ View team member progress
✅ See who's in the team

**Pages:** Teams, Tasks

### VOLUNTEER
✅ Request to join teams
✅ View available teams in events
✅ See assigned tasks
✅ Update task status (TODO → IN_PROGRESS → COMPLETED)

**Pages:** Events, Teams, Tasks

---

## Running the Application

### Backend
```bash
cd backend
npm install  # if not already done
npx prisma migrate deploy  # apply migrations
npm run dev  # starts on http://localhost:3000
```

### Frontend
```bash
cd eventflow-hub-main
npm install  # if not already done
npm run dev  # starts on http://localhost:5173 or similar
```

The app will be available at `http://localhost:5173`

---

## API Endpoints Summary

### Admin Endpoints (POST /api/admin/*)
- `GET /admin/users` - List all users with pagination
- `GET /admin/roles` - List available roles
- `GET /admin/clubs` - List all clubs (for coordinator assignment)
- `GET /admin/clubs/:clubId/events` - Get events of a club
- `GET /admin/events/:eventId/teams` - Get teams of an event
- `POST /admin/users` - Create new user with roles
- `PATCH /admin/users/:id/roles` - Assign/update roles with coordinator details
- `DELETE /admin/users/:id` - Delete user

### Clubs Endpoints
- `GET /clubs` - List all clubs
- `POST /clubs` - Create club (admin only)
- `PUT /clubs/:id` - Update club (admin only)
- `DELETE /clubs/:id` - Delete club (admin only)

### Teams Endpoints
- `GET /teams/event/:eventId` - Get teams of an event
- `GET /teams/:id` - Get team details
- `POST /teams` - Create team (admin only)
- `PUT /teams/:id` - Update team (admin/team lead)
- `DELETE /teams/:id` - Delete team (admin only)
- `POST /teams/:teamId/join` - Request to join team
- `POST /teams/requests/:requestId/approve` - Approve join request
- `POST /teams/requests/:requestId/reject` - Reject join request

### Events Endpoints
- `GET /events` - List events
- `POST /events` - Create event (admin only, must include clubId)

### Tasks Endpoints
- `GET /tasks/my` - Get user's assigned tasks
- `POST /tasks` - Create task (team lead)
- `POST /tasks/:taskId/assign` - Assign task to user
- `DELETE /tasks/:taskId/assign/:userId` - Remove user from task

---

## Frontend Pages & Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/dashboard` | Everyone | Overview of user's role and stats |
| `/users` | Admin/SuperAdmin | Manage users and assign roles |
| `/clubs` | Admin/SuperAdmin/ClubCoord | Manage clubs and create teams |
| `/events` | Everyone | Create/view events with club selection |
| `/teams` | Everyone | View teams, request to join, manage requests |
| `/tasks` | Team Lead/Volunteer | Create tasks, assign volunteers, track progress |
| `/registrations` | Admin/Faculty | View event registrations |
| `/referrals` | Campus Ambassador | Manage referral codes |
| `/notifications` | Everyone | View notifications |
| `/reports` | Admin | View system reports |

---

## Key Features

### 1. Role Assignment with Specific Context
When assigning a role, additional fields appear:
- **CLUB_COORDINATOR** → Select which club
- **FACULTY_COORDINATOR** → Select which event  
- **TEAM_LEAD** → Select which team (via club → event → team cascade)

### 2. Dynamic Cascading Selectors
In the Users Management page:
- First select CLUB for club coordinators
- First select CLUB, then EVENT for faculty coordinators
- First select CLUB, then EVENT, then TEAM for team leads

### 3. Sidebar Auto-Filters
The sidebar automatically shows/hides pages based on user's roles:
- Admins see: Users, Clubs, Events, Teams, Tasks, Reports
- Club Coordinators see: Clubs, Events, Teams, Tasks
- Faculty Coordinators see: Events, Teams
- Team Leads/Volunteers see: Events, Teams, Tasks

### 4. Team Join Request Workflow
1. Volunteer sees all teams on Teams page
2. Clicks "Request to Join"
3. Request goes to faculty coordinator of that event
4. Faculty coordinator approves/rejects
5. Approved request adds user to team members

---

## Testing Checklist

### 1. Admin Setup
- [ ] Login as Super Admin
- [ ] Create a club (Clubs page)
- [ ] Create an event linked to that club (Events page, select club)
- [ ] Assign a user as Club Coordinator for that club
- [ ] Assign a user as Faculty Coordinator for that event
- [ ] Assign a user as Team Lead for a team

### 2. Club Coordinator
- [ ] Login as club coordinator
- [ ] View "Clubs" tab (should only see assigned club)
- [ ] View events of that club
- [ ] See team management options

### 3. Faculty Coordinator
- [ ] Login as faculty coordinator
- [ ] View "Teams" tab
- [ ] See teams only from assigned event
- [ ] Approve/reject join requests
- [ ] View team member progress

### 4. Team Lead
- [ ] Login as team lead
- [ ] Create tasks for the team
- [ ] Assign tasks to team members
- [ ] View team progress

### 5. Volunteer
- [ ] Login as volunteer
- [ ] Go to Teams page
- [ ] Request to join a team
- [ ] View assigned tasks
- [ ] Update task status

---

## Troubleshooting

**Users not showing in Users page:**
- Check if logged in as SUPER_ADMIN or ADMIN
- Verify `/api/admin/users` endpoint returns data
- Check browser console for API errors

**Role assignment form not showing coordinator fields:**
- Only appears when specific role checkbox is selected
- Club/Event/Team dropdowns populate dynamically from API

**Cannot create event:**
- Must select a club from dropdown
- Club must exist (create via Clubs page first)

**Team join requests not appearing:**
- Only visible to faculty coordinator of that event
- Must be assigned as FACULTY_COORDINATOR for that event

**Sidebar not showing expected tabs:**
- Roles must be assigned correctly in database
- Clear browser cache and re-login if just changed roles

---

## Environment Variables

Add these to `.env` files:

**Backend (`backend/.env`):**
```
DATABASE_URL=postgresql://user:password@localhost:5432/eventdb
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Frontend (`eventflow-hub-main/.env`):**
```
VITE_API_URL=http://localhost:3000/api
```

---

## Summary

You now have a complete event management system with:
✅ Role-based access control
✅ Hierarchical coordinator assignments (club → event → team)
✅ Team join request workflow with approvals
✅ Task assignment and tracking
✅ Admin user management
✅ Dynamic form fields based on role selection
✅ Complete sidebar navigation filtering

All pages and APIs are fully connected and ready to use!
