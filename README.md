# NWA Jumpers - Bounce House Booking System

A **prototype** full-stack booking system for bounce house rentals built with React, TypeScript, Node.js, Express, and SQLite.

> **🚧 This is a prototype/demo project** - The booking form and features are subject to change as we iterate and improve the system.

## 🎯 Current Status

**✅ Phase 1 Complete: Static Prototype**
- Beautiful categories page with 2x4 grid layout
- 4 real categories (Castle, Superhero, Sports, Toddler) + 4 "Coming Soon" placeholders
- Full-width background and responsive design
- Complete frontend routing structure ready for interactivity
- Backend API with SQLite database fully functional

**🚀 Ready for Phase 2: Interactive Features**
- Categories are currently static (not clickable)
- Next step: Make categories clickable to navigate to inflatables
- Full user flow: Categories → Inflatables → Booking Form

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
- [x] Project structure created
- [x] Git repository initialized
- [x] Frontend scaffolded with Vite + React + TypeScript
- [x] Backend initialized with Express + TypeScript
- [x] Dependencies installed
- [x] Basic Express server with health check endpoint
- [x] Set up SQLite database connection
- [x] Create bookings table schema
- [x] Database initialization on server startup
- [x] Build POST /api/bookings endpoint
- [x] Build GET /api/bookings endpoint
- [x] Create frontend booking form component
- [x] Connect frontend to backend API
- [x] **NEW: Beautiful 2x4 grid categories page with 4 real categories + 4 "Coming Soon" placeholders**
- [x] **NEW: Full-width background and responsive design**
- [x] **NEW: Professional hover effects and styling**
- [x] **NEW: Complete frontend routing structure (Categories → Inflatables → Booking)**
- [x] **NEW: Inflatables data structure with categorized bounce houses**
- [x] **NEW: TypeScript type safety throughout the application**

### 🚀 Phase 2: Interactive Features (NEXT UP)
- [ ] **Make categories clickable** - Navigate from categories to inflatables page
- [ ] **Test full user flow** - Categories → Inflatables → Booking Form
- [ ] **Add navigation between pages** - Back buttons and proper routing
- [ ] **Connect inflatables to booking form** - Pre-populate selected inflatable

### 📅 Phase 3: Calendar Integration (Week 2)
- [ ] **Admin Calendar View** - Visual calendar showing booked (red) vs available (green) dates
- [ ] **Date availability checking** - Real-time availability in booking form
- [ ] **Calendar component** - Interactive date picker with availability status

### 🎯 Phase 4: Admin Features (Week 2)
- [ ] **Admin Dashboard** - View all bookings with filtering and sorting
- [ ] **CSV Export** - Download booking data
- [ ] **Enhanced UI** - Tailwind CSS styling and responsive design
- [ ] **Final testing and deployment**

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
- **GET** `http://localhost:3001/api/bookings` - Get all bookings (ordered by date)
- **POST** `http://localhost:3001/api/bookings` - Create new booking
- **GET** `http://localhost:3001/api/bookings/availability/:date` - Check if date is available
  - Example: `GET /api/bookings/availability/2025-10-15`
  - Response: `{ "date": "2025-10-15", "isAvailable": true, "bookings": 0, "message": "Date is available" }`

### Future Features (Prototype Roadmap)
- 📅 **Admin Calendar View** - Visual calendar showing booked (red) vs available (green) dates
- 📊 **Admin Dashboard** - View all bookings with filtering and sorting
- 📄 **CSV Export** - Download booking data
- 🎨 **Enhanced UI** - Tailwind CSS styling and responsive design

