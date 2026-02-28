# Commands Cheatsheet

## Setup & Initialization

```bash
# First time setup
cd backend
npm install
npx prisma migrate deploy          # Apply all migrations
npx prisma generate                # Generate Prisma client
cd ../eventflow-hub-main
npm install
```

## Running Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev                         # Starts on http://localhost:3000

# Terminal 2 - Frontend  
cd eventflow-hub-main
npm run dev                         # Starts on http://localhost:5173
```

## Database

```bash
# View/edit database in UI
cd backend
npx prisma studio                  # Opens http://localhost:5555

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations (production)
npx prisma migrate deploy

# Generate/regenerate client
npx prisma generate

# Check migrations status
npx prisma migrate status
```

## Development

```bash
# Backend
cd backend
npm run dev                         # Start dev server with hot reload
npm run build                       # Build for production
npm run start                       # Start production build
npm run lint                        # Run linter

# Frontend
cd eventflow-hub-main
npm run dev                         # Start dev server
npm run build                       # Build for production
npm run preview                     # Preview production build
npm run lint                        # Run linter
```

## Debugging

```bash
# View server logs
npm run dev                         # Logs appear in terminal

# View database queries
# Set DEBUG environment variable
DEBUG=* npm run dev                 # Show all debug logs
DEBUG=prisma:* npm run dev          # Show Prisma logs only

# Browser DevTools
# Frontend: Press F12 in browser
# Look at Network tab to see API calls
# Look at Console tab for JavaScript errors
```

## Testing the System

```bash
# Create a test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "password123"
  }'

# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'

# Use token for authenticated requests
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common URLs

```
Frontend:        http://localhost:5173
Backend API:     http://localhost:3000/api
Database UI:     http://localhost:5555
Health Check:    http://localhost:3000/health
```

## Troubleshooting Commands

```bash
# Check if ports are in use
lsof -i :3000                      # Check port 3000
lsof -i :5173                      # Check port 5173
lsof -i :5555                      # Check port 5555

# Kill process using port (macOS/Linux)
kill -9 <PID>                      # Replace PID from lsof output

# Windows: Kill port
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Clear npm cache if install fails
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Reset everything
npx prisma migrate reset
npm run dev
```

## Git Commands (For Your GitHub)

```bash
# Check current branch
git branch
git status

# Pull latest changes
git pull origin main

# Create new branch for feature
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "Add feature description"

# Push to GitHub
git push origin feature/my-feature

# Create pull request (via GitHub UI)
```

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/eventdb
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-key-here
```

### Frontend (.env or .env.local)
```bash
VITE_API_URL=http://localhost:3000/api
```

## Production Deployment

```bash
# Build frontend
cd eventflow-hub-main
npm run build                       # Creates dist/ folder

# Build backend
cd ../backend
npm run build

# Deploy to server
# Push to GitHub
# Deploy from GitHub/Vercel dashboard
# Or deploy manually to your server

# On production server:
npm install
npx prisma migrate deploy          # Run migrations
npm run start                       # Start production
```

## Docker (Optional)

```bash
# If you want to containerize:
# Build Docker image
docker build -t event-management .

# Run container
docker run -p 3000:3000 -p 5173:5173 event-management
```

## Useful VS Code Extensions

- **Prisma** (for schema syntax highlighting)
- **REST Client** (for testing API endpoints)
- **Database Clients** (for DB viewing)
- **ES Lint** (for code quality)
- **Prettier** (for code formatting)

## Quick Testing APIs

```bash
# Create club
curl -X POST http://localhost:3000/api/clubs \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Tech Club"}'

# List clubs
curl http://localhost:3000/api/clubs

# Get all users
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer TOKEN"

# Create event
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Fest",
    "description": "Annual tech festival",
    "clubId": "CLUB_ID_HERE",
    "startTime": "2026-03-15T09:00:00Z",
    "endTime": "2026-03-15T17:00:00Z",
    "location": "Campus"
  }'
```

## Monitor Application Health

```bash
# Check if backend is running
curl http://localhost:3000/health

# Check database connection
curl http://localhost:3000/health/db

# View logs
tail -f backend/logs/*.log         # If logging to file

# Monitor resource usage
top                                 # macOS/Linux
# Task Manager                      # Windows
```

## Version Management

```bash
# Check Node version
node -v

# Check npm version  
npm -v

# Update npm
npm install -g npm@latest

# List global packages
npm list -g --depth=0

# Update project dependencies
npm update
npm audit fix
```

## Useful References

- API Docs: Check COMPLETE_SETUP_GUIDE.md
- Architecture: Check ARCHITECTURE.md
- Setup Guide: Check QUICK_START.md
- Database Schema: Check backend/prisma/schema.prisma
- Frontend Routes: Check eventflow-hub-main/src/App.tsx
- API Routes: Check backend/src/app.ts

---

## Quick Workflows

### Add a new API endpoint
1. Create service function in `backend/src/modules/*/module.service.ts`
2. Add validation schema in `backend/src/modules/*/module.validation.ts`
3. Add route in `backend/src/modules/*/module.routes.ts`
4. Register route in `backend/src/app.ts` (if new module)
5. Create frontend API call in component
6. Test with curl or REST Client

### Add a new page
1. Create `eventflow-hub-main/src/pages/MyPage.tsx`
2. Add route in `App.tsx`
3. Add sidebar link in `DashboardLayout.tsx`
4. Add role requirements to route and link

### Add a new role
1. Add to database (manually via Prisma Studio)
2. Update Role enum in schema if needed
3. Update role checks in services
4. Update sidebar filtering logic
5. Update route protection

---

## Memory

```bash
# If something is broken, start fresh:
cd backend
npx prisma migrate reset          # ⚠️ Deletes data
npm install
npm run dev

cd ../eventflow-hub-main
npm install  
npm run dev

# Then access http://localhost:5173
```

That's it! You're ready to develop. 🚀
