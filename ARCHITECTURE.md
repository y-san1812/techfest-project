# Event Management System - Architecture Overview

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS & ROLES                            │
├─────────────────────────────────────────────────────────────────┤
│ User                          UserRole              Role          │
│ ├─ id                         ├─ userId ──────────→ ├─ id         │
│ ├─ email                      ├─ roleId ────────────┤ name        │
│ ├─ password                   └─ (composite PK)     └─ description
│ ├─ name                                                           │
│ └─ timestamps                                                     │
│                                                                    │
│ User also has:                                                    │
│ ├─ clubCoordinator ──→ ClubCoordinator                           │
│ ├─ facultyCoordinator ─→ EventFacultyCoordinator                │
│ ├─ teamsLed ──→ Team[] (as TeamLead)                            │
│ ├─ teamMembers ──→ TeamMember[]                                 │
│ ├─ joinRequests ──→ TeamJoinRequest[]                           │
│ └─ taskAssignments ──→ TaskAssignment[]                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CLUBS & COORDINATORS                          │
├─────────────────────────────────────────────────────────────────┤
│ Club                          ClubCoordinator                     │
│ ├─ id                         ├─ id                              │
│ ├─ name                       ├─ clubId ──────────→ (to Club)    │
│ ├─ timestamps                 ├─ userId ────────→ (to User)     │
│ └─ events ──→ Event[]         ├─ assignedAt                      │
│ └─ coordinators ─→ ClubCoordinator[]  └─ (unique: clubId,userId)│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EVENTS & FACULTY                              │
├─────────────────────────────────────────────────────────────────┤
│ Event                         EventFacultyCoordinator             │
│ ├─ id                         ├─ eventId ────────→ (to Event)    │
│ ├─ title                      ├─ userId ───────→ (to User)      │
│ ├─ description                ├─ assignedAt                      │
│ ├─ category                   └─ (composite PK: eventId,userId) │
│ ├─ clubId ────────→ Club                                         │
│ ├─ status (DRAFT/PUBLISHED/CLOSED)                              │
│ ├─ startTime, endTime                                           │
│ ├─ location                                                      │
│ ├─ registrationCap                                              │
│ ├─ timestamps                                                    │
│ ├─ teams ──→ Team[]                                             │
│ └─ facultyCoordinators ──→ EventFacultyCoordinator[]            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              TEAMS & TEAM MEMBERS & JOIN REQUESTS                │
├─────────────────────────────────────────────────────────────────┤
│ Team                          TeamMember         TeamJoinRequest │
│ ├─ id                         ├─ id               ├─ id           │
│ ├─ name                       ├─ teamId ────────┐ ├─ teamId      │
│ ├─ eventId ────→ Event        ├─ userId ────────┤ ├─ userId      │
│ ├─ teamLeadId ──→ User        └─ (unique pair)  │ ├─ status      │
│ ├─ timestamps                 │ user: User      │ └─ timestamps  │
│ ├─ members ──→ TeamMember[]   │                 │ team: Team     │
│ ├─ joinRequests ─→ TeamJoinRequest[]          │ user: User     │
│ └─ tasks ──→ Task[]            │                │                │
│                                 └────────────────→ (unique pair) │
│ Event                                                             │
│ └─ A team belongs to ONE event                                  │
│ └─ A team has ONE team lead (User with TEAM_LEAD role)         │
│ └─ A team can have MANY team members (via TeamMember)          │
│ └─ Volunteers can request to join (via TeamJoinRequest)        │
│ └─ Faculty coordinator approves requests for the event         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    TASKS & ASSIGNMENTS                           │
├─────────────────────────────────────────────────────────────────┤
│ Task                          TaskAssignment                     │
│ ├─ id                         ├─ id                              │
│ ├─ title                      ├─ taskId ──────→ Task             │
│ ├─ description                ├─ userId ─────→ User             │
│ ├─ deadline                   ├─ status (TODO/IN_PROGRESS/..)   │
│ ├─ teamId ────→ Team          ├─ timestamps                      │
│ ├─ timestamps                 └─ (unique: taskId,userId)        │
│ ├─ assignments ─→ TaskAssignment[]                              │
│ └─ comments ───→ TaskComment[]                                  │
│                                                                    │
│ Multiple users can be assigned to same task                     │
│ Each assignment has individual status                           │
└─────────────────────────────────────────────────────────────────┘
```

## Role Hierarchy & Permissions

```
┌──────────────────────────────────────────────────────────────────┐
│                    ROLE PERMISSION MODEL                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  SUPER_ADMIN (Full Access)                                       │
│  ├─ Manage all users and assign roles                           │
│  ├─ Create/Edit/Delete Clubs                                    │
│  ├─ Create/Edit/Delete Events (select club)                     │
│  ├─ Assign Club Coordinators (select club)                      │
│  ├─ Assign Faculty Coordinators (select event)                  │
│  ├─ Assign Team Leads (select team)                             │
│  ├─ Create Teams                                                 │
│  ├─ View/Manage Tasks                                           │
│  └─ View Reports                                                │
│                                                                    │
│  ADMIN (Same as Super Admin)                                    │
│  └─ Same permissions as SUPER_ADMIN                             │
│                                                                    │
│  CLUB_COORDINATOR (Club-Level Admin)                            │
│  ├─ View assigned club's events and teams                       │
│  ├─ Create teams (for events in assigned club)                 │
│  ├─ Manage team members                                         │
│  └─ View tasks within their club's teams                        │
│                                                                    │
│  FACULTY_COORDINATOR (Event-Level Overseer)                     │
│  ├─ View assigned event's teams                                 │
│  ├─ See all team members and progress                           │
│  ├─ APPROVE/REJECT team join requests                           │
│  └─ View tasks in assigned event's teams                        │
│                                                                    │
│  TEAM_LEAD (Team-Level Manager)                                 │
│  ├─ Create tasks for their team                                 │
│  ├─ Assign tasks to team members                                │
│  ├─ View team member progress                                   │
│  ├─ Request to join requests (approve as faculty only)          │
│  └─ Cannot create teams (only admin)                            │
│                                                                    │
│  VOLUNTEER (Team Member)                                        │
│  ├─ See available events and teams                              │
│  ├─ REQUEST to join teams                                       │
│  ├─ View assigned tasks                                         │
│  ├─ Update task status                                          │
│  └─ Cannot create anything                                      │
│                                                                    │
│  CAMPUS_AMBASSADOR                                              │
│  ├─ Manage referral codes                                       │
│  └─ (No access to event management)                             │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Role Assignment Flow (Admin→Users Page)

```
Admin selects User
    ↓
Admin checks role checkboxes (CLUB_COORDINATOR, FACULTY_COORDINATOR, TEAM_LEAD)
    ↓
Dynamic fields appear based on selected roles:
    ├─ CLUB_COORDINATOR → "Select Club" dropdown
    │   └─ Fetches from /api/admin/clubs
    ├─ FACULTY_COORDINATOR → "Select Club" → "Select Event" dropdowns
    │   └─ Fetches clubs, then events of selected club
    └─ TEAM_LEAD → "Select Club" → "Select Event" → "Select Team"
        └─ Fetches clubs, events, teams in cascade
    ↓
Admin clicks "Save Roles"
    ↓
PATCH /api/admin/users/:id/roles with:
    { roles: [...], clubId?, eventId?, teamId? }
    ↓
Backend:
    ├─ Updates UserRole entries
    ├─ Creates/updates ClubCoordinator if CLUB_COORDINATOR + clubId
    ├─ Creates/updates EventFacultyCoordinator if FACULTY_COORDINATOR + eventId
    └─ Updates Team.teamLeadId if TEAM_LEAD + teamId
    ↓
Response: Success → Page refreshes → User now has new roles
```

### 2. Team Join Request Flow (Volunteer→Teams Page)

```
Volunteer logs in
    ↓
Navigates to /teams page
    ↓
Sees list of events
    ↓
Selects an event → sees teams in that event
    ↓
Clicks "Request to Join" on a team
    ↓
POST /api/teams/:teamId/join
    ↓
Backend creates TeamJoinRequest:
    ├─ Status: PENDING
    ├─ Associated with the team
    └─ Associated with the volunteer
    ↓
Response: Request created
    ↓
Faculty Coordinator (for that event) logs in
    ↓
Sees pending join requests in Teams page
    ↓
Clicks "Approve" or "Reject"
    ↓
Approve:
    ├─ POST /api/teams/requests/:id/approve
    ├─ Backend updates status to APPROVED
    ├─ Creates TeamMember entry
    └─ Volunteer is now in the team
    ↓
Volunteer can now see themselves as team member
```

### 3. Task Assignment Flow (Team Lead→Tasks Page)

```
Team Lead creates a task
    ↓
POST /api/tasks with:
    { title, description, deadline, teamId }
    ↓
Task created for the team
    ↓
Team Lead assigns task to volunteers
    ↓
POST /api/tasks/:taskId/assign with:
    { userId }
    ↓
Backend creates TaskAssignment:
    ├─ Status: TODO (initial)
    ├─ Linked to task
    └─ Linked to user
    ↓
Volunteer sees task in their dashboard
    ↓
Volunteer updates status: TODO → IN_PROGRESS → COMPLETED
    ↓
Team Lead can see each volunteer's progress on each task
```

## API Module Structure

```
backend/src/
├── modules/
│   ├── admin/
│   │   ├── admin.routes.ts          (User/Role CRUD + coordinator endpoints)
│   │   ├── admin.service.ts         (setUserRoles with coordinator logic)
│   │   └── admin.validation.ts
│   ├── clubs/
│   │   ├── clubs.routes.ts          (Club CRUD)
│   │   ├── clubs.service.ts
│   │   └── clubs.validation.ts
│   ├── events/
│   │   ├── events.routes.ts         (Event CRUD, now includes clubId)
│   │   ├── events.service.ts
│   │   └── events.validation.ts
│   ├── teams/
│   │   ├── teams.routes.ts          (Team CRUD + join request flow)
│   │   ├── teams.service.ts         (requestToJoinTeam, approveJoinRequest)
│   │   └── teams.validation.ts
│   ├── tasks/
│   │   ├── tasks.routes.ts          (Task CRUD + assignments)
│   │   ├── tasks.service.ts         (assignTask, unassignTask)
│   │   └── tasks.validation.ts
│   ├── faculty/
│   │   ├── faculty.routes.ts        (Faculty coordinator operations)
│   │   ├── faculty.service.ts
│   │   └── faculty.validation.ts
│   └── [other modules]
└── app.ts                            (All routers registered here)
```

## Frontend Component Structure

```
eventflow-hub-main/src/
├── pages/
│   ├── DashboardPage.tsx            (Role-based dashboard)
│   ├── UsersPage.tsx                (Admin: assign roles with dynamic fields)
│   ├── ClubsPage.tsx                (Admin: manage clubs)
│   ├── EventsPage.tsx               (Everyone: events with club selection)
│   ├── TeamsPage.tsx                (Everyone: view teams, request to join)
│   ├── TasksPage.tsx                (Team lead/Volunteer: tasks & progress)
│   └── [other pages]
├── components/
│   ├── layout/
│   │   └── DashboardLayout.tsx      (Sidebar with role-based nav filtering)
│   └── [UI components]
└── App.tsx                           (Route definitions with role guards)
```

## Database Migration Timeline

```
20260227173946_init
├─ Creates User, Role, UserRole
├─ Creates Event, Team, TeamMember
├─ Creates Task, TaskComment
├─ Creates Referral, Payment, Notification, ActivityLog
└─ Initial schema foundation

20260228_update_schema
├─ Adds Club model
├─ Adds EventFacultyCoordinator (many-to-many)
├─ Adds TeamJoinRequest (with PENDING/APPROVED/REJECTED states)
├─ Adds TaskAssignment (many-to-many with status)
└─ Removes old Registration table
└─ Links Event.clubId to Club

20260301_add_club_coordinator
├─ Adds ClubCoordinator model (many-to-many)
├─ Creates unique constraint on (clubId, userId)
└─ Enables club-level coordinator assignments
```

## Key Integration Points

1. **Admin → Users Page**: Dynamic role assignment with contextual fields
2. **Users Page**: Cascading dropdowns (Club → Event → Team)
3. **Teams Page**: Join request workflow with approval logic
4. **Events Page**: Club selection when creating events
5. **Sidebar**: Auto-filters navigation based on user roles
6. **API**: All endpoints check roles and restrict access appropriately

## Summary

This is a **role-based hierarchical event management system** where:
- **Admins** manage everything at the top level
- **Club Coordinators** oversee specific clubs
- **Faculty Coordinators** oversee specific events
- **Team Leads** manage specific teams
- **Volunteers** work within teams on assigned tasks

The system uses many-to-many relationships with "through" tables (ClubCoordinator, EventFacultyCoordinator, TeamJoinRequest, TaskAssignment) to track specific contexts for each role assignment.
