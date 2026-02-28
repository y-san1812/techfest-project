# Quick Start - 5 Minutes to Running

## Prerequisites
- Node.js 18+
- PostgreSQL running
- `.env` files configured with DATABASE_URL (backend) and VITE_API_URL (frontend)

## Run in 3 Steps

### 1. Database Setup (One-time)
```bash
cd backend
npx prisma migrate deploy
```

### 2. Start Backend
```bash
cd backend
npm run dev
# Runs on http://localhost:3000
```

### 3. Start Frontend (in new terminal)
```bash
cd eventflow-hub-main
npm run dev
# Runs on http://localhost:5173
```

App is ready at **http://localhost:5173**

---

## Test It Out (Quick Demo)

### Login as Super Admin
- Email: (your first user created in signup flow)
- Role: SUPER_ADMIN

### Create Test Data
1. **Create Club** → Go to `/clubs` → Click "Create Club"
2. **Create Event** → Go to `/events` → Select the club you created
3. **Create User** → Go to `/users` → Create new user with VOLUNTEER role
4. **Create Team** → Go to `/teams` → Need team lead first
5. **Assign Team Lead** → Back to `/users` → Select volunteer → Check "TEAM_LEAD" → Select your club/event/team → Save
6. **Create Team as Team Lead** → Go to `/teams` → Now you can create teams

---

## Roles Quick Reference

| Role | Key Permission | Goes To |
|------|---|---|
| SUPER_ADMIN | Everything | `/users`, `/clubs`, `/events` |
| ADMIN | Everything | `/users`, `/clubs`, `/events` |
| CLUB_COORDINATOR | Manage club teams | `/clubs`, `/teams` |
| FACULTY_COORDINATOR | Approve join requests | `/teams` (event's teams only) |
| TEAM_LEAD | Assign tasks | `/tasks`, `/teams` (own team) |
| VOLUNTEER | Request to join, do tasks | `/teams`, `/tasks` |

---

## Common Tasks

### Make Someone Admin
1. Go to `/users`
2. Search for user
3. Check "SUPER_ADMIN" or "ADMIN"
4. Save

### Make Someone Club Coordinator
1. Go to `/users`
2. Search for user
3. Check "CLUB_COORDINATOR"
4. Select a club from dropdown
5. Save

### Make Someone Team Lead
1. Go to `/users`
2. Search for user
3. Check "TEAM_LEAD"
4. Select Club → Event → Team (cascading)
5. Save
6. Now they can create tasks for that team

### Let Volunteer Join a Team
1. Login as volunteer
2. Go to `/teams`
3. Select event → see teams
4. Click "Request to Join"
5. **Admin/Faculty logs in**
6. Go to `/teams`
7. See pending requests
8. Click "Approve"
9. Volunteer is now in team

### Assign Task to Volunteer
1. Login as team lead
2. Go to `/tasks`
3. Create new task
4. Assign to volunteer
5. Volunteer sees it in their tasks
6. Can update status: TODO → IN_PROGRESS → COMPLETED

---

## File Locations

**Key Backend Files:**
- Database schema: `/backend/prisma/schema.prisma`
- Admin API: `/backend/src/modules/admin/admin.routes.ts`
- Teams API: `/backend/src/modules/teams/teams.routes.ts`
- Server setup: `/backend/src/app.ts`

**Key Frontend Files:**
- Users page: `/eventflow-hub-main/src/pages/UsersPage.tsx`
- Clubs page: `/eventflow-hub-main/src/pages/ClubsPage.tsx`
- Teams page: `/eventflow-hub-main/src/pages/TeamsPage.tsx`
- Sidebar nav: `/eventflow-hub-main/src/components/layout/DashboardLayout.tsx`
- Routes: `/eventflow-hub-main/src/App.tsx`

---

## Troubleshooting

**Backend won't start:**
```bash
npx prisma db push        # Sync schema
npx prisma generate      # Regenerate client
npm run dev              # Try again
```

**Users page blank:**
- Make sure you're logged in as SUPER_ADMIN or ADMIN
- Check browser console for API errors (F12)

**Cannot see Clubs tab:**
- User must have ADMIN, SUPER_ADMIN, or CLUB_COORDINATOR role

**Roles form not showing club/event/team selectors:**
- They only appear when you CHECK the role checkbox
- They load dynamically from API

---

## Key Concept: Coordinator Assignments

When assigning roles, you link them to specific contexts:

```
User → CLUB_COORDINATOR ──→ Club (which club?)
       ↓
       FACULTY_COORDINATOR ──→ Event (which event?)
       ↓
       TEAM_LEAD ──→ Team (which team?)
```

These relationships are stored in:
- **ClubCoordinator** table (user ↔ club)
- **EventFacultyCoordinator** table (user ↔ event)
- **Team.teamLeadId** (user → team)

---

## What You've Built

✅ **Multi-role system** with 6 different roles  
✅ **Hierarchical access** (club → event → team → member)  
✅ **Team join workflow** with request/approval  
✅ **Task management** with multi-user assignments  
✅ **Dynamic UI** that filters based on roles  
✅ **Complete CRUD** for all entities  
✅ **Cascading selectors** for role assignments  

**Everything is fully integrated and ready to use!**
