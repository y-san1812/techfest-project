# Event Management System for TechFest

A complete, production-ready event management system with **role-based access control**, **hierarchical coordinator assignments**, and **team management workflow**.

## ⚡ Quick Start

```bash
# 1. Setup database (one time)
cd backend && npx prisma migrate deploy

# 2. Start backend
npm run dev  # http://localhost:3000

# 3. Start frontend (new terminal)
cd eventflow-hub-main && npm run dev  # http://localhost:5173
```

**Done!** Visit http://localhost:5173

See `QUICK_START.md` for 5-minute setup.

## 📚 Documentation

- **`QUICK_START.md`** - 5-minute setup guide with common tasks
- **`COMPLETE_SETUP_GUIDE.md`** - Comprehensive guide with all features, APIs, and workflows
- **`ARCHITECTURE.md`** - Visual diagrams and system design
- **`IMPLEMENTATION_COMPLETE.md`** - Feature checklist and deployment guide
- **`GITHUB_SYNC_STATUS.md`** - Verification that everything is in GitHub

## 🎯 Key Features

### 6 Roles with Hierarchical Access
| Role | Access Level | Can Do |
|------|---|---|
| **SUPER_ADMIN** | System-wide | Manage everything |
| **ADMIN** | System-wide | Manage everything |
| **CLUB_COORDINATOR** | Specific club | Manage events & teams in their club |
| **FACULTY_COORDINATOR** | Specific event | Oversee teams & approve join requests |
| **TEAM_LEAD** | Specific team | Create tasks & assign work |
| **VOLUNTEER** | Team member | Request to join & complete tasks |

### Core Functionality
✅ **User Management** - Create users, assign roles with contextual links (club/event/team)  
✅ **Club Management** - Create and organize clubs  
✅ **Event Management** - Create events linked to clubs  
✅ **Team Management** - Create teams, manage members, approve join requests  
✅ **Task Management** - Create tasks, assign to multiple volunteers, track progress  
✅ **Role-Based UI** - Sidebar automatically filters pages based on role  
✅ **Dynamic Forms** - Club/Event/Team selectors cascade based on role selection  

## 🏗️ System Architecture

```
Users with Roles
    ↓
Assign to contexts: Club → Event → Team
    ↓
Club Coordinators manage their club's events
    ↓
Faculty Coordinators oversee their event's teams
    ↓
Team Leads manage their team's tasks
    ↓
Volunteers join teams and complete tasks
```

### Database Relationships
```
Club
  ├─ Events
  │   └─ Teams
  │       ├─ Members (TeamMember)
  │       ├─ Tasks
  │       │   └─ Assignments (TaskAssignment)
  │       └─ Join Requests (TeamJoinRequest)
  └─ Coordinators (ClubCoordinator)

Event
  └─ Faculty Coordinators (EventFacultyCoordinator)

Team
  └─ Team Lead (User)
```

## 🔄 Key Workflows

### Assign a Club Coordinator
1. Go to `/users`
2. Select user
3. Check "CLUB_COORDINATOR"
4. Select club from dropdown
5. Save → User is now coordinator for that club

### Assign a Faculty Coordinator  
1. Go to `/users`
2. Select user
3. Check "FACULTY_COORDINATOR"
4. Select club → dropdown loads events of that club
5. Select event
6. Save → User is now coordinator for that event

### Assign a Team Lead
1. Go to `/users`
2. Select user
3. Check "TEAM_LEAD"
4. Select club → event → team (cascading dropdowns)
5. Save → User is now lead for that team

### Volunteer Joins Team
1. Login as volunteer
2. Go to `/teams` → select event
3. See teams → click "Request to Join"
4. Faculty coordinator sees request → approves
5. Volunteer is now team member

### Team Lead Creates Tasks
1. Login as team lead
2. Go to `/tasks` → create task
3. Assign to volunteers
4. Volunteers see task → update status → progress tracked

## 📁 Project Structure

```
event-management-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma (Complete DB schema)
│   │   └── migrations/ (3 migrations)
│   └── src/
│       ├── modules/
│       │   ├── admin/ (User/role management)
│       │   ├── clubs/ (Club CRUD)
│       │   ├── events/ (Event CRUD with clubId)
│       │   ├── teams/ (Team CRUD + join requests)
│       │   ├── tasks/ (Task CRUD + assignments)
│       │   └── faculty/ (Faculty operations)
│       └── app.ts (All routes registered)
│
└── eventflow-hub-main/
    └── src/
        ├── pages/
        │   ├── UsersPage.tsx (Role assignment with cascading selectors)
        │   ├── ClubsPage.tsx
        │   ├── EventsPage.tsx
        │   ├── TeamsPage.tsx
        │   └── TasksPage.tsx
        ├── components/layout/
        │   └── DashboardLayout.tsx (Role-based sidebar)
        └── App.tsx (Protected routes with role guards)
```

## 🔐 Security Features

✅ JWT authentication  
✅ Role-based access control (RBAC)  
✅ Password hashing (bcrypt)  
✅ Input validation (Zod)  
✅ Protected API endpoints  
✅ Protected routes with role guards  
✅ Foreign key constraints  
✅ Secure error messages  

## 📊 Database Schema Highlights

### New Models (Built for this system)
- `ClubCoordinator` - Links users to clubs they coordinate
- `EventFacultyCoordinator` - Links users to events they oversee
- `TeamJoinRequest` - Workflow for volunteers to join teams
- `TaskAssignment` - Multiple users can be assigned same task

### Key Design
- **No orphaned data** - Cascade deletes ensure consistency
- **Unique constraints** - Prevent duplicate assignments
- **Proper indexes** - Fast queries on foreign keys
- **Status tracking** - Each relationship has timestamp and status

## 🚀 Deployment Checklist

Before production:
- [ ] Set strong JWT_SECRET in environment
- [ ] Configure secure database credentials
- [ ] Run all migrations: `npx prisma migrate deploy`
- [ ] Set CORS for your domain
- [ ] Enable HTTPS
- [ ] Set up monitoring and alerts
- [ ] Configure email notifications
- [ ] Test all workflows with different roles

## 🧪 Testing Workflows

See `IMPLEMENTATION_COMPLETE.md` for detailed test scenarios.

Quick test:
1. Create club → event → team
2. Assign someone as faculty coordinator
3. Assign someone else as team lead
4. Login as volunteer → join team (request)
5. Login as faculty → approve request
6. Login as team lead → create task → assign
7. Login as volunteer → see task → update status

## 📖 API Overview

### Admin Endpoints
- `GET /admin/users` - List users
- `POST /admin/users` - Create user
- `PATCH /admin/users/:id/roles` - Assign roles
- `GET /admin/roles` - List roles
- `GET /admin/clubs` - List clubs (for cascading)
- `GET /admin/clubs/:clubId/events` - Get events of club
- `GET /admin/events/:eventId/teams` - Get teams of event

### Teams Endpoints
- `GET /teams/event/:eventId` - Get event's teams
- `POST /teams/:teamId/join` - Request to join
- `POST /teams/requests/:requestId/approve` - Faculty approves
- `POST /teams/requests/:requestId/reject` - Faculty rejects

### Other Endpoints
See `COMPLETE_SETUP_GUIDE.md` for full API reference.

## 🎓 Learning Resources

- **How cascading works:** Look at `UsersPage.tsx` - when you select CLUB_COORDINATOR, it shows clubs. When FACULTY_COORDINATOR is checked, it shows Club→Event cascade.
- **How role assignment persists:** See `admin.service.ts:setUserRoles()` - it creates entries in ClubCoordinator, EventFacultyCoordinator, or updates Team.teamLeadId
- **How team joins work:** See `teams.service.ts` - requestToJoinTeam → approveJoinRequest flow
- **How sidebar filters:** See `DashboardLayout.tsx` - filteredLinks uses hasRole() check

## 🐛 Troubleshooting

**Users page blank?** Make sure you're logged in as ADMIN or SUPER_ADMIN  
**Role fields not showing?** Check the checkbox for the role first  
**Clubs selector empty?** Create a club first via `/clubs` page  
**Cannot see sidebar tabs?** User doesn't have that role - check `/users` page

See `COMPLETE_SETUP_GUIDE.md` for more troubleshooting.

## 📝 What's Implemented

- [x] Complete database schema with migrations
- [x] All backend APIs with role checks
- [x] All frontend pages with proper access control
- [x] Dynamic role assignment with cascading fields
- [x] Team join request workflow
- [x] Task assignment and tracking
- [x] Role-based sidebar navigation
- [x] Input validation and error handling
- [x] Authentication with JWT
- [x] Comprehensive documentation

## 🎉 What's Next?

Ready to use immediately. Optional enhancements:
- Real-time updates with WebSockets
- Email notifications
- File upload for submissions
- Team chat
- Mobile app
- Advanced analytics

---

## 📞 Support

All code is documented. If you have questions:
1. Check `COMPLETE_SETUP_GUIDE.md` for feature details
2. Check `ARCHITECTURE.md` for system design
3. Check `QUICK_START.md` for common tasks
4. Look at code comments in relevant service/route files

---

## 🏆 Summary

You have a **complete, production-ready event management system** with hierarchical roles, dynamic coordinator assignments, and team management workflow. 

**Just run `npm run dev` in both directories and you're ready to go!**

Happy hacking! 🚀
