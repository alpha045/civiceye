# CivicEye — Civic Complaint Management System

A full-stack MERN application for citizens to report civic issues and for
government authorities to manage and resolve them.

## Tech Stack
- Frontend: React 19, Vite, Tailwind CSS v4, Redux Toolkit, React Router DOM v7, Axios, Recharts
- Backend:  Node.js, Express.js v5, MongoDB, Mongoose, JWT, bcryptjs

─────────────────────────────────────────────────────────
## QUICK START
─────────────────────────────────────────────────────────

### Step 1 — Backend Setup

Open a terminal:

    cd backend
    npm install

Create a .env file (copy from .env.example):

    cp .env.example .env

Open .env and set your MongoDB URI:

    MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/civiceye
    JWT_SECRET=civiceye_jwt_secret_2024
    PORT=5000
    NODE_ENV=development

IMPORTANT — Seed demo data (run this ONCE before first login):

    npm run seed

Start the backend server:

    npm run dev

Backend runs at: http://localhost:5000


### Step 2 — Frontend Setup

Open a SECOND terminal:

    cd frontend
    npm install
    npm run dev

Frontend runs at: http://localhost:5173
Open this URL in your browser.

─────────────────────────────────────────────────────────
## Demo Login Accounts (only available after running seed)
─────────────────────────────────────────────────────────

  Role        | Email            | Password
  ------------|------------------|----------
  Citizen     | user@demo.com    | demo123
  Admin       | admin@demo.com   | demo123
  Super Admin | super@demo.com   | demo123

─────────────────────────────────────────────────────────
## Why "user not found" on login?
─────────────────────────────────────────────────────────

You must run the seed script first to create demo accounts:

    cd backend
    npm run seed

─────────────────────────────────────────────────────────
## Features
─────────────────────────────────────────────────────────

Citizen Portal:
  - Register, login, profile management
  - Submit complaints with photo, category, priority, location
  - Track complaint by unique ID (e.g. CIV-A1B2C3)
  - View history and status updates
  - Notifications on status changes

Government Admin Panel:
  - Dashboard with stats and charts
  - Manage all complaints — filter, update status, assign departments
  - Department CRUD management
  - Visual reports (Recharts bar/pie charts)

Super Admin Panel:
  - Platform-wide analytics
  - User management (activate/deactivate/delete)
  - Create new admin accounts

─────────────────────────────────────────────────────────
## Getting a Free MongoDB Database
─────────────────────────────────────────────────────────

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free M0 cluster
4. Go to Database Access → Add a user
5. Go to Network Access → Allow 0.0.0.0/0
6. Click Connect → Drivers → copy the connection string
7. Replace <password> with your password and paste in .env as MONGO_URI


brew services start mongodb-community# civiceye
