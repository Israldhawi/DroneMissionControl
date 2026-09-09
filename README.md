# Drone Mission Control

## Project Overview
Drone Mission Control is an internal web application for tracking and managing drone missions.

## Technology Stack
- Frontend: React, TypeScript, Tailwind CSS, Vite
- Backend: Express, TypeScript, Node.js
- Database: SQLite with better-sqlite3
- Authentication: JWT and bcryptjs
- Testing: Vitest

## Main Features
- Authentication and role-based access
- Mission creation, editing and details
- Mission search, filters, sorting and pagination
- Mission status lifecycle
- Pilot management
- Dashboard statistics and chart
- Light and dark theme

## Business Rules
- R-01: Battery start/end validation
- R-02: Mission duration must be 1-120 whole minutes
- R-03: Future missions cannot be completed
- R-04: Pilots cannot have overlapping missions
- R-05: Inactive pilots cannot receive new missions
- R-06: Valid mission status lifecycle is enforced
- R-07: Abort reason must contain at least 10 characters
- R-08: Pilot email and license numbers must be unique
- R-09: Pilots can only access their own missions

## API Endpoints
- POST /auth/login
- GET /missions
- GET /missions/:id
- POST /missions
- PUT /missions/:id
- DELETE /missions/:id
- GET /pilots
- POST /pilots
- PUT /pilots/:id
- GET /stats

## Installation
### Backend
cd backend
npm install
npx tsx src/db/init.ts
npx tsx seed/seed.ts
npm run dev

### Frontend
cd frontend
npm install
npm run dev

## Testing
Manual test cases: 41
Automated Vitest tests: 38
All 38 automated tests currently pass.

Run backend tests:
npm test -- --run

Run backend build:
npm run build

Run frontend build:
npm run build

## Test Accounts
Admin: mohammed@example.com / Admin123!
Pilot: ahmed@example.com / Test1234!

## Test Documentation
Manual test cases are documented in tests/TEST-CASES.md.
