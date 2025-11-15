# NWA Jumpers - Bounce House Booking System

A full-stack booking system for bounce house rentals built with React, TypeScript, Node.js, Express, and SQLite.

## Overview

This project is a complete booking management system that allows customers to browse inflatables, check availability, and create bookings. It includes an admin dashboard for managing bookings, generating PDF quotes, and tracking inventory.

## Current Status

**Core Functionality**
- Responsive categories grid with inflatable browsing
- Category → Inflatable → Booking flow with pre-filled selections
- Dark-mode UI across all components
- Integrated availability calendar with real-time booking checks
- Booking form with date/time selection and validation
- Shopping cart system for multiple bookings
- Quote generation with pricing breakdown
- Admin dashboard with date filtering and PDF export
- Backend REST API with SQLite persistence
- Inflatable-specific availability checking

**Deployment Ready**
- Environment variable configuration for production
- CORS configured for production domains
- Production build scripts ready
- See `DEPLOYMENT.md` for full deployment guide
- See `QUICK_START.md` for fast-track deployment

**Inventory Import System**
- Excel-to-TypeScript conversion script included
- See `INVENTORY_IMPORT_GUIDE.md` for importing real inventory data
- Template and step-by-step instructions provided

**Ongoing Improvements**
- Inventory data import and catalog updates
- Enhanced error handling and validation
- Admin authentication and access control
- Additional export formats (CSV, email summaries)

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
   FRONTEND_URL=http://localhost:5173
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   The API will run on `http://localhost:3001`

### Frontend

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with:
   ```
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:5173`

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite3
- **Styling**: CSS with responsive design
- **PDF Generation**: PDFKit

## Features

### Customer Features
- Browse inflatables by category
- View detailed inflatable information (pricing, capacity, dimensions)
- Interactive calendar with real-time availability checking
- Multi-item shopping cart
- Quote generation with tax calculation
- Form validation and error handling

### Admin Features
- View all bookings by date
- Edit booking details and pricing
- Generate PDF rental agreements
- Track booking items and line items
- Internal notes and customer information management

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
  organization_name TEXT,
  event_address TEXT,
  event_surface TEXT,
  event_is_indoor INTEGER,
  invoice_number TEXT,
  contract_number TEXT,
  setup_date TEXT,
  delivery_window TEXT,
  after_hours_window TEXT,
  discount_percent REAL,
  subtotal_amount REAL,
  delivery_fee REAL,
  tax_amount REAL,
  total_amount REAL,
  deposit_amount REAL,
  balance_due REAL,
  payment_method TEXT,
  internal_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**File Location:** `node-api/bookings.db` (auto-created on server start)

### Booking Items Table
```sql
CREATE TABLE booking_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  quantity REAL DEFAULT 1,
  unit_price REAL DEFAULT 0,
  product_name TEXT NOT NULL,
  product_category TEXT,
  total_price REAL DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
```

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
- **GET** `/api/bookings` - Get all bookings (ordered by event date)
- **POST** `/api/bookings` - Create new booking
- **GET** `/api/bookings/availability/:date?inflatable=type` - Check availability for a date and optional inflatable type
  - Example: `GET /api/bookings/availability/2025-10-15?inflatable=Princess%20Castle`
  - Response: `{ "date": "2025-10-15", "isAvailable": true, "bookingsCount": 0, "message": "Date is available" }`
- **GET** `/api/bookings/by-date/:date` - Admin endpoint to fetch bookings for a date
- **GET** `/api/bookings/:id` - Fetch a single booking with admin fields and line items
- **PUT** `/api/bookings/:id` - Update booking details, cost breakdown, and line items
- **GET** `/api/bookings/:id/pdf` - Download printable PDF summary for a booking

## Development Notes

### Manual Database Upgrade
If you need to add new columns to existing databases, run the following SQL statements (skip any columns that already exist):

```sql
ALTER TABLE bookings ADD COLUMN organization_name TEXT;
ALTER TABLE bookings ADD COLUMN event_address TEXT;
ALTER TABLE bookings ADD COLUMN event_surface TEXT;
ALTER TABLE bookings ADD COLUMN event_is_indoor INTEGER;
ALTER TABLE bookings ADD COLUMN invoice_number TEXT;
ALTER TABLE bookings ADD COLUMN contract_number TEXT;
ALTER TABLE bookings ADD COLUMN setup_date TEXT;
ALTER TABLE bookings ADD COLUMN delivery_window TEXT;
ALTER TABLE bookings ADD COLUMN after_hours_window TEXT;
ALTER TABLE bookings ADD COLUMN discount_percent REAL;
ALTER TABLE bookings ADD COLUMN subtotal_amount REAL;
ALTER TABLE bookings ADD COLUMN delivery_fee REAL;
ALTER TABLE bookings ADD COLUMN tax_amount REAL;
ALTER TABLE bookings ADD COLUMN total_amount REAL;
ALTER TABLE bookings ADD COLUMN deposit_amount REAL;
ALTER TABLE bookings ADD COLUMN balance_due REAL;
ALTER TABLE bookings ADD COLUMN payment_method TEXT;
ALTER TABLE bookings ADD COLUMN internal_notes TEXT;

CREATE TABLE IF NOT EXISTS booking_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  quantity REAL DEFAULT 1,
  unit_price REAL DEFAULT 0,
  product_name TEXT NOT NULL,
  product_category TEXT,
  total_price REAL DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
```

Note: SQLite does not support `IF NOT EXISTS` on `ADD COLUMN`, so you can ignore "duplicate column name" errors if a column is already present.

## Future Enhancements

- Payment integration and pricing calculator
- Customer booking confirmation emails/SMS
- Multi-day rentals & delivery logistics tracking
- Enhanced admin authentication and role management
- Automated inventory management
- Advanced reporting and analytics

## License

ISC
