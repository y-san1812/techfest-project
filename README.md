🎉 TechFest Management System

A full-stack Tech Fest Management System built with:

Frontend: React + TypeScript + Vite + Tailwind

Backend: Node.js + Express + TypeScript

Database: PostgreSQL

ORM: Prisma

Authentication: JWT-based auth

Password Hashing: bcrypt

🚀 Features

Role-based authentication system

Multiple admin-level roles

Event creation & management

Club management

Registration system

Referral system (Campus Ambassador)

Secure password hashing

JWT authentication

🏗️ Project Structure
backend/
  ├── prisma/
  ├── src/
  ├── package.json
  └── tsconfig.json

frontend/
  ├── src/
  ├── public/
  ├── package.json
  └── vite.config.ts
⚙️ Setup Instructions
1️⃣ Backend Setup
cd backend
npm install

Create a .env file:

DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/techfest"
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1d
PORT=4000

Run migrations:

npx prisma migrate dev

Seed database:

npx prisma db seed

Start backend:

npm run dev

Backend runs on:

http://localhost:4000
2️⃣ Frontend Setup
cd frontend
npm install
cp .env.example .env
npm run dev

Frontend runs on:

http://localhost:5173

Make sure .env contains:

VITE_API_BASE_URL="http://localhost:4000/api"
🔐 Seeded Login Credentials

The database seed creates default accounts for each role.

You can use the following credentials to log in:

👑 SUPER ADMIN

Email: superadmin@techfest.local

Password: superadm1n1812

🛠 ADMIN

Email: admin@techfest.local

Password: admin1234

🎓 FACULTY COORDINATOR

Email: faculty@techfest.local

Password: faculty1234

🏛 CLUB COORDINATOR

Email: club@techfest.local

Password: club1234

👥 TEAM LEAD

Email: teamlead@techfest.local

Password: teamlead1234

🌍 CAMPUS AMBASSADOR

Email: ambassador@techfest.local

Password: amba55ador1812

Referral Code:

AMBASSADOR2026
🗂 Seeded Data
Clubs

GDG

MSA

Events

Hackathon 2026 (Published)

Robotics Challenge (Draft)

🔐 Authentication Flow

User logs in

Backend validates credentials

JWT token is generated

Token is used for protected routes

Role-based access is enforced server-side

🧠 Role Hierarchy

SUPER_ADMIN

ADMIN

FACULTY_COORDINATOR

CLUB_COORDINATOR

TEAM_LEAD

VOLUNTEER

CAMPUS_AMBASSADOR

🛠 Tech Stack

Frontend:

React

TypeScript

Vite

Tailwind CSS

Backend:

Express

Prisma

PostgreSQL

JWT

bcrypt

📌 Notes

All seeded passwords are hashed using bcrypt.

JWT secret must be configured in .env.

Make sure PostgreSQL service is running.

If backend changes, restart the server.
