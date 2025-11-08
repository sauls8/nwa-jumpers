# NWA Jumpers - Bounce House Booking System

A **prototype** full-stack booking system for bounce house rentals built with React, TypeScript, Node.js, Express, and SQLite.

> **🚧 This is a prototype/demo project** - The booking form and features are subject to change as we iterate and improve the system.

## 🎯 Current Status

**✅ Core Prototype Functionality Complete**
- Responsive categories grid (4 live categories + 4 placeholders)
- Category → Inflatable → Booking flow with pre-filled selections
- Dark-mode UI across categories, inflatables, booking form, and admin tools
- Integrated availability calendar pulling live data from SQLite
- Booking form captures event date plus start/end times with validation
- Admin dashboard filters bookings by date and exports PDF summaries
- Backend REST API with SQLite persistence, availability checks, and PDF generation

**🛠️ Entering Refinement Phase**
- Next focus areas: data accuracy, copy/design polish, admin UX, and deployment readiness
- See “🔍 Refinement Roadmap” for detailed tasks and known gaps

## Project Structure

```
nwa-jumpers/
├── frontend/          # React + TypeScript + Vite
└── node-api/         # Express + TypeScript + SQLite
```

## Setup Instructions

### Backend (Node API)

1. Navigate to the backend folder:
   ```bash
   cd node-api
   ```

2. Create a `.env` file in the `node-api` directory with:
   ```
   PORT=3001
   NODE_ENV=development
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The API will run on `http://localhost:3001`

### Frontend

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:5173`

## Development Roadmap

### ✅ Phase 1: Static Prototype (COMPLETED)
- [x] Project skeleton (React + Vite + TypeScript frontend, Express + TypeScript backend)
- [x] Git workflow established, `.gitignore` configured
- [x] SQLite connection & bookings table bootstrap
- [x] Health check endpoint and basic CRUD wiring
- [x] Categories grid (4 live + 4 “Coming Soon”) with responsive styling
- [x] Inflatables dataset and reusable component structure
- [x] Dark-mode visual baseline

### ✅ Phase 2: Interactive Features (COMPLETED)
- [x] Category → Inflatable → Booking navigation & back buttons
- [x] Booking form pre-populates selected inflatable
- [x] Form validation + success/failure feedback
- [x] End-to-end API integration with fetch + async handling

### ✅ Phase 3: Calendar Integration (COMPLETED)
- [x] Interactive calendar component with month navigation
- [x] Real-time availability checks (booked = red, available = green)
- [x] Calendar-driven date selection inside the booking form
- [x] Dark-mode styling + mobile responsiveness

### ✅ Phase 4: Admin Features (COMPLETED)
- [x] Admin dashboard view with date picker & booking count summary
- [x] Filter bookings by event date (real data from API)
- [x] PDF summary export via backend `pdfkit`
- [x] Booking form captures event start/end times
- [x] Availability endpoint and admin dashboard handle legacy records without times

### 🔍 Refinement Roadmap (Week 3+)
- [ ] Replace placeholder copy/images with real catalog content
- [ ] Add admin authentication / access control
- [ ] Improve error states (network failures, empty results, validation hints)
- [ ] Allow admin to refresh bookings without toggling date (manual refresh button or auto polling)
- [ ] Surface booking source (web/phone/manual) & internal notes field
- [ ] CSV export or email summary for daily schedule
- [ ] Deployment checklist (env handling, build scripts, hosting strategy)

### 🚧 Future Enhancements (Wish List)
- [ ] Payment integration & pricing calculator
- [ ] Customer booking confirmation emails/SMS
- [ ] Multi-day rentals & delivery logistics tracking
- [ ] Tailwind or component library adoption once UI stabilizes

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite3
- **Styling**: CSS (Tailwind coming in Week 2)

## Database Schema

### Bookings Table
```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_start_time TEXT NOT NULL,
  event_end_time TEXT NOT NULL,
  bounce_house_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**File Location:** `node-api/bookings.db` (auto-created on server start)

## Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Endpoints

### Health Check
- **GET** `http://localhost:3001/api/health` - Check if API is running
  - Response: `{ "status": "ok", "message": "NWA Jumpers API is running" }`

### Bookings API
- **GET** `http://localhost:3001/api/bookings` - Get all bookings (ordered by event date)
- **POST** `http://localhost:3001/api/bookings` - Create new booking (requires event start/end time)
- **GET** `http://localhost:3001/api/bookings/availability/:date` - Check if specific date has any bookings
  - Example: `GET /api/bookings/availability/2025-10-15`
  - Response: `{ "date": "2025-10-15", "isAvailable": true, "bookings": 0, "message": "Date is available" }`
- **GET** `http://localhost:3001/api/bookings/by-date/:date` - Admin endpoint to fetch bookings for a date
  - Example: `GET /api/bookings/by-date/2025-10-31`
  - Response: `{ "date": "...", "bookings": [ { ...booking fields... } ] }`
- **GET** `http://localhost:3001/api/bookings/:id/pdf` - Download printable PDF summary for a booking
  - Response headers: `Content-Type: application/pdf`, attachment filename `booking-<id>.pdf`

### Admin UI Quick Start
- Launch both dev servers (`cd node-api && npm run dev`, `cd frontend && npm run dev -- --host`)
- Visit `http://localhost:5173`, click **Admin Dashboard**
- Pick a date to load bookings, download PDFs via “⬇ Download PDF”
- Create a new booking from the customer flow and toggle the date picker to refresh

### Known Gaps During Refinement
- Legacy seed bookings lack event start/end times (displayed as “Time TBD” until updated)
- No authentication separating admin/customer views
- No direct way to refresh admin data without touching the date picker
- Deployment pipeline & environment configs still local-only
- Test coverage limited to manual end-to-end checks

