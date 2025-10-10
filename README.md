# NWA Jumpers - Bounce House Booking System

A full-stack booking system for bounce house rentals built with React, TypeScript, Node.js, Express, and SQLite.

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

### ✅ Week 1 - Day 1 (Completed)
- [x] Project structure created
- [x] Git repository initialized
- [x] Frontend scaffolded with Vite + React + TypeScript
- [x] Backend initialized with Express + TypeScript
- [x] Dependencies installed
- [x] Basic Express server with health check endpoint
- [x] Set up SQLite database connection
- [x] Create bookings table schema
- [x] Database initialization on server startup

### 🔄 Next Steps (Days 2-4)
- [ ] Build POST /api/bookings endpoint
- [ ] Build GET /api/bookings endpoint
- [ ] Test endpoints with Postman/Thunder Client

### 📅 Days 5-7
- [ ] Create booking form component in React
- [ ] Connect frontend to backend API
- [ ] Display submitted bookings
- [ ] Add form validation

### 📅 Week 2 (Days 8-14)
- [ ] Admin dashboard
- [ ] CSV export functionality
- [ ] Add Tailwind CSS
- [ ] Responsive design
- [ ] Final testing and deployment

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

*More endpoints coming soon...*

