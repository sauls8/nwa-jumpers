# Where Node.js is Used in This Project

## Overview
Node.js runs as a **separate server process** in the `node-api/` directory. It's completely separate from your React frontend.

## Directory Structure

```
nwa-jumpers/
├── frontend/              ← React app (runs in browser)
│   └── src/
│       ├── services/
│       │   └── bookingService.ts  ← Makes HTTP requests TO Node.js
│       └── config/
│           └── api.ts              ← Points to Node.js server URL
│
└── node-api/             ← **THIS IS NODE.JS** 🟢
    ├── package.json      ← Node.js dependencies & scripts
    ├── src/
    │   ├── index.ts      ← Node.js server entry point
    │   ├── database.ts   ← Node.js database operations
    │   ├── routes/
    │   │   └── bookings.ts ← Node.js API endpoints
    │   └── models/
    │       └── bookingSchema.ts
    └── bookings.db       ← SQLite database file (created by Node.js)
```

## Specific Files Using Node.js

### 1. **node-api/src/index.ts** - The Main Server
This file **starts the Node.js server**:
- Creates Express app
- Sets up CORS middleware
- Starts listening on port 3001
- Initializes database

**Key Node.js code:**
```1:50:node-api/src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database';
import bookingsRouter from './routes/bookings';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration - allow frontend origin from environment or default to localhost
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'NWA Jumpers API is running' });
});

// Bookings routes
app.use('/api/bookings', bookingsRouter);

/**
 * Initialize database and start server
 */
const startServer = async () => {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Then start the server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();
```

### 2. **node-api/src/database.ts** - Database Operations
This file uses Node.js to:
- Connect to SQLite database
- Read/write to file system
- Create database tables
- Run SQL queries

**Key Node.js code:**
```1:30:node-api/src/database.ts
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { createBookingItemsTableQuery, createBookingsTableQuery } from './models/bookingSchema';

/**
 * Database Configuration
 * Using SQLite for local development
 */

// Database file path (will be created in node-api directory)
const DB_PATH = path.join(__dirname, '..', 'bookings.db');

// Create SQLite database instance
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Promisify database methods for async/await support
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));
```

### 3. **node-api/src/routes/bookings.ts** - API Endpoints
This file defines all the API endpoints that handle:
- GET /api/bookings - Fetch all bookings
- POST /api/bookings - Create new booking
- POST /api/bookings/quote - Create quote with items
- GET /api/bookings/:id/pdf - Generate PDF (requires Node.js!)
- PUT /api/bookings/:id - Update booking
- GET /api/bookings/availability/:date - Check availability

**This is where Node.js processes requests from your React frontend.**

### 4. **node-api/package.json** - Node.js Configuration
This file tells Node.js:
- What dependencies to install (Express, SQLite, PDFKit)
- What scripts to run (`npm run dev` starts the Node.js server)
- That this IS a Node.js project

**Key parts:**
```6:10:node-api/package.json
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

```15:22:node-api/package.json
  "dependencies": {
    "@types/pdfkit": "^0.17.3",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "pdfkit": "^0.17.2",
    "sqlite3": "^5.1.7"
  },
```

## How Frontend Connects to Node.js

### Frontend Makes HTTP Requests

**frontend/src/config/api.ts:**
```7:7:frontend/src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
```

**frontend/src/services/bookingService.ts:**
The frontend makes fetch requests like:
```typescript
fetch('http://localhost:3001/api/bookings/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingData)
})
```

## When Node.js Runs

1. **Development:** 
   - Run `npm run dev` in `node-api/` folder
   - Node.js server starts on `http://localhost:3001`
   - Frontend (React) runs on `http://localhost:5173`
   - They communicate via HTTP requests

2. **Production:**
   - Build Node.js: `npm run build` → creates `dist/` folder
   - Run Node.js: `npm start` → runs compiled JavaScript
   - Frontend builds separately and makes requests to Node.js server URL

## What Node.js Does That Frontend Can't

1. **File System Access**
   - Creates/reads `bookings.db` SQLite file
   - Writes database records

2. **PDF Generation**
   - Uses `pdfkit` library (requires Node.js)
   - Generates PDF files server-side
   - Browser can't do this securely

3. **Persistent Storage**
   - SQLite database persists data
   - Frontend localStorage is temporary

4. **Server-Side Processing**
   - Business logic hidden from browser
   - Database queries
   - Data validation

5. **CORS & Security**
   - Controls which frontends can access API
   - Protects database credentials

## Quick Test: Is Node.js Running?

1. Open terminal in `node-api/` folder
2. Run: `npm run dev`
3. You should see: `Server running on http://localhost:3001`
4. Open browser: `http://localhost:3001/api/health`
5. You should see: `{"status":"ok","message":"NWA Jumpers API is running"}`

If that works, Node.js is running! ✅

## TypeScript vs Node.js: What's the Difference?

### Common Confusion: "Is it just TypeScript?"

**No!** Here's the relationship:

**TypeScript** = The **LANGUAGE** you write code in (`.ts` files)
**Node.js** = The **RUNTIME** that **EXECUTES** the code (runs JavaScript)

### The Compilation Process

Look at the scripts in `package.json`:

```6:10:node-api/package.json
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

**Development (`npm run dev`):**
1. You write: `src/index.ts` (TypeScript)
2. `ts-node` automatically converts TypeScript → JavaScript in memory
3. **Node.js** runs the JavaScript
4. Server starts on port 3001

**Production (`npm run build` then `npm start`):**
1. You write: `src/index.ts` (TypeScript)
2. `tsc` compiles TypeScript → JavaScript files in `dist/`
3. `node dist/index.js` - **Node.js** runs the compiled JavaScript

### Analogy

Think of it like:
- **TypeScript** = Writing in English (what you write)
- **Node.js** = Speaking/executing (what actually runs)
- **JavaScript** = The intermediate language (what TypeScript becomes)

You could write in pure JavaScript too, but TypeScript adds type safety.

### What Node.js Actually Does

Node.js is the **program** that:
- Runs JavaScript code
- Listens on network ports (3001)
- Accesses file system (SQLite database)
- Handles HTTP requests/responses
- Can run 24/7 as a server

TypeScript is just a **language** - it needs something to **run** it.

### Could You Use JavaScript Instead?

Yes! You could write everything in `.js` files instead of `.ts`, and Node.js would run it the same way. TypeScript just adds:
- Type checking
- Better autocomplete
- Catches errors before runtime

But you'd still need **Node.js** to actually run it.

### Summary

- **TypeScript** = Language (what you write) ✅
- **Node.js** = Runtime (what executes it) ✅
- **Express** = Framework (runs on Node.js) ✅
- **SQLite** = Database (accessed via Node.js) ✅

You're writing in TypeScript, but **Node.js is what makes it run as a server**.

## Summary

- **Node.js location:** Entire `node-api/` directory
- **Main entry:** `node-api/src/index.ts` (TypeScript, compiled to JavaScript)
- **API routes:** `node-api/src/routes/bookings.ts`
- **Database:** `node-api/src/database.ts`
- **Runs on:** Port 3001 (separate from React on 5173)
- **Communication:** Frontend makes HTTP requests → Node.js responds
- **Language:** TypeScript (compiles to JavaScript)
- **Runtime:** Node.js (executes the JavaScript)

The frontend (`frontend/`) and backend (`node-api/`) are **completely separate applications** that talk to each other via HTTP.

