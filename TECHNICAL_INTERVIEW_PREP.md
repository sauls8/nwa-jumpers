# Technical Interview Preparation Guide

## 🎯 Overview

This guide prepares you for technical questions about three key projects:
1. **Lawnly** - React + API integration
2. **NWA Jumpers** - SQLite, Node.js, booking workflow
3. **Voltage Divider** - OOP, C++ modeling

---

## 📦 Project 1: NWA Jumpers

### Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite3
- **Key Features:** Booking system, availability checking, PDF generation, admin dashboard

---

### Technical Questions & Answers

#### Q: "Walk me through the booking workflow from frontend to database."

**Answer:**
"The booking workflow follows a clear data flow pattern:

1. **User Selection** - Customer browses categories and selects inflatables, which navigates to `BookingForm.tsx`

2. **Form Submission** - User fills out customer info, event details, and selects items. Real-time validation provides immediate feedback using a `validateField()` function that checks inputs on every change.

3. **State Management** - When the form is submitted, data flows up to `App.tsx` which manages global state:
   - `customerInfo` - Customer details
   - `eventInfo` - Event date/time
   - `cart` - Selected inflatables
   - `quoteInfo` - Additional booking details

4. **Quote Review** - User is taken to `QuotePage.tsx` which:
   - Displays all cart items
   - Calculates pricing automatically (discounts, fees, tax)
   - Allows item removal

5. **API Submission** - `QuotePage` calls `submitQuote()` from `bookingService.ts`, which:
   - Transforms cart items to API format
   - Validates all required fields
   - POSTs to `/api/bookings/quote`

6. **Backend Processing** - The Express route handler:
   - Validates input (email format, required fields)
   - Calculates totals if not provided
   - Creates booking record in SQLite
   - Creates booking_item records for each inflatable
   - Returns booking ID

7. **Database Storage** - Two normalized tables:
   - `bookings` - Customer and event information
   - `booking_items` - Individual items with foreign key to bookings

This design ensures data integrity, supports multiple items per booking, and maintains separation of concerns."

**Code Reference:**
```452:488:node-api/src/routes/bookings.ts
// New endpoint to check availability for a specific date and inflatable type
router.get('/availability/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { inflatable } = req.query; // Optional query parameter for inflatable type
    
    let query: string;
    let params: unknown[];
    
    if (inflatable && typeof inflatable === 'string') {
      // Check availability for specific inflatable type
      query = 'SELECT * FROM bookings WHERE event_date = ? AND bounce_house_type = ?';
      params = [date, inflatable];
    } else {
      // Check availability for any booking on this date (backward compatible)
      query = getBookingsByDateQuery;
      params = [date];
    }
    
    const bookings = await new Promise<Booking[]>((resolve, reject) => {
      database.instance.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as Booking[]);
      });
    });
    
    res.json({
      date,
      isAvailable: bookings.length === 0,
      bookingsCount: bookings.length,
      message: bookings.length === 0 ? 'Date is available' : 'Date is booked'
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});
```

---

#### Q: "How does your database schema support multiple items per booking?"

**Answer:**
"I designed a normalized database schema with two tables:

1. **`bookings` table** - Stores customer information, event details, and pricing summary
2. **`booking_items` table** - Stores individual items with a foreign key relationship

**Key Design Decisions:**
- **Foreign Key Constraint:** `booking_items.booking_id` references `bookings.id` with `ON DELETE CASCADE` - if a booking is deleted, all items are automatically removed
- **Normalized Design:** Avoids data duplication - customer info stored once per booking
- **Flexible:** Can add/remove items without modifying the booking record
- **Query Efficiency:** Use JOINs to fetch complete booking with items

**Example Query Pattern:**
```typescript
// Fetch booking with items
const booking = await fetchBookingById(bookingId);
const items = await fetchBookingItemsByBookingIds([bookingId]);
const enrichedBooking = { ...booking, items: items.get(bookingId) ?? [] };
```

This pattern allows efficient batch fetching - I can fetch items for multiple bookings in a single query using `IN` clause, then group them by booking_id using a Map."

**Code Reference:**
```37:66:node-api/src/routes/bookings.ts
const fetchBookingItemsByBookingIds = async (bookingIds: number[]): Promise<Map<number, BookingItem[]>> => {
  if (bookingIds.length === 0) {
    return new Map();
  }

  const placeholders = bookingIds.map(() => '?').join(',');
  const rows = await new Promise<BookingItem[]>((resolve, reject) => {
    database.instance.all(
      `SELECT * FROM booking_items WHERE booking_id IN (${placeholders}) ORDER BY id ASC`,
      bookingIds,
      (err, result) => {
        if (err) reject(err);
        else resolve(result as BookingItem[]);
      }
    );
  });

  const grouped = new Map<number, BookingItem[]>();
  for (const row of rows) {
    const list = grouped.get(row.booking_id) ?? [];
    list.push({
      ...row,
      quantity: Number(row.quantity ?? 0),
      unit_price: Number(row.unit_price ?? 0),
      total_price: Number(row.total_price ?? 0),
    });
    grouped.set(row.booking_id, list);
  }
  return grouped;
};
```

---

#### Q: "How do you handle SQLite database operations in Node.js?"

**Answer:**
"I use the `sqlite3` package with promisified methods for async/await support:

**Key Patterns:**

1. **Promisification:** Convert callback-based SQLite methods to Promises:
```typescript
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));
```

2. **Database Initialization:** On server start, I check if tables exist and create them if needed. I also handle migrations by checking for missing columns and adding them dynamically.

3. **Error Handling:** All database operations are wrapped in try-catch blocks with meaningful error messages.

4. **Transaction Safety:** For multi-step operations (like creating a booking with items), I use sequential awaits to ensure data consistency. In production, I'd use transactions.

5. **Type Safety:** I use TypeScript interfaces that match the database schema, ensuring type safety when reading/writing data.

**Example:**
```typescript
const bookingResult = await new Promise<{ lastID: number }>((resolve, reject) => {
  database.instance.run(
    `INSERT INTO bookings (...) VALUES (...)`,
    [params],
    function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID });
    }
  );
});
```

This pattern gives me the booking ID immediately after insertion, which I then use to create related booking_items."

**Code Reference:**
```1:110:node-api/src/database.ts
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

/**
 * Check if a column exists in a table
 */
const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    const columns = await dbAll(`PRAGMA table_info(${tableName})`) as Array<{ name: string }>;
    return columns.some(col => col.name === columnName);
  } catch {
    return false;
  }
};

/**
 * Add missing columns to bookings table
 */
const migrateBookingsTable = async (): Promise<void> => {
  const columnsToAdd = [
    { name: 'organization_name', type: 'TEXT' },
    { name: 'event_address', type: 'TEXT' },
    { name: 'event_surface', type: 'TEXT' },
    { name: 'event_is_indoor', type: 'INTEGER' },
    { name: 'invoice_number', type: 'TEXT' },
    { name: 'contract_number', type: 'TEXT' },
    { name: 'setup_date', type: 'TEXT' },
    { name: 'delivery_window', type: 'TEXT' },
    { name: 'after_hours_window', type: 'TEXT' },
    { name: 'discount_percent', type: 'REAL' },
    { name: 'subtotal_amount', type: 'REAL' },
    { name: 'delivery_fee', type: 'REAL' },
    { name: 'tax_amount', type: 'REAL' },
    { name: 'total_amount', type: 'REAL' },
    { name: 'deposit_amount', type: 'REAL' },
    { name: 'balance_due', type: 'REAL' },
    { name: 'payment_method', type: 'TEXT' },
    { name: 'internal_notes', type: 'TEXT' },
  ];

  for (const column of columnsToAdd) {
    const exists = await columnExists('bookings', column.name);
    if (!exists) {
      try {
        await dbRun(`ALTER TABLE bookings ADD COLUMN ${column.name} ${column.type}`);
        console.log(`Added column ${column.name} to bookings table`);
      } catch (error) {
        // Column might have been added by another process, ignore error
        console.log(`Column ${column.name} may already exist`);
      }
    }
  }
};

/**
 * Initialize the database by creating tables and migrating if needed
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Create tables if they don't exist
    await dbRun(createBookingsTableQuery);
    await dbRun(createBookingItemsTableQuery);
    
    // Migrate existing tables to add missing columns
    await migrateBookingsTable();
    
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Export database methods for use in routes
 */
export const database = {
  run: dbRun,
  get: dbGet,
  all: dbAll,
  // Raw db instance for special cases
  instance: db,
};

export default database;
```

---

#### Q: "How do you handle availability checking? What about race conditions?"

**Answer:**
"Availability checking happens at two levels:

1. **Frontend Check:** The calendar component checks availability for each date by calling `/api/bookings/availability/:date`. This provides immediate feedback to users.

2. **Backend Validation:** When a quote is submitted, the backend checks if the date is already booked. However, there's a potential race condition if two users submit simultaneously.

**Current Implementation:**
- Availability check is a simple query: `SELECT * FROM bookings WHERE event_date = ?`
- If `bookings.length === 0`, the date is available

**Race Condition Problem:**
If User A and User B both check availability at the same time and both see the date as available, they could both create bookings for the same date.

**Solutions I'd Implement:**
1. **Database Constraints:** Add a unique constraint on `(event_date, bounce_house_type)` if each inflatable can only be rented once per day
2. **Optimistic Locking:** Use a version number or timestamp to detect concurrent modifications
3. **Transaction with Lock:** Use SQLite transactions with appropriate locking
4. **Application-Level Lock:** Use a mutex/semaphore for booking creation

**Example with Transaction:**
```typescript
await database.instance.run('BEGIN TRANSACTION');
try {
  // Check availability within transaction
  const existing = await dbAll('SELECT * FROM bookings WHERE event_date = ?', [date]);
  if (existing.length > 0) {
    throw new Error('Date already booked');
  }
  // Create booking
  await dbRun('INSERT INTO bookings ...', [...]);
  await database.instance.run('COMMIT');
} catch (error) {
  await database.instance.run('ROLLBACK');
  throw error;
}
```

For production, I'd also implement a reservation system with expiration times."

---

#### Q: "Explain your API design and error handling patterns."

**Answer:**
"I follow RESTful principles with clear endpoint structure:

**Endpoint Design:**
- `GET /api/bookings` - List all bookings
- `GET /api/bookings/:id` - Get single booking
- `GET /api/bookings/by-date/:date` - Get bookings for a date
- `GET /api/bookings/availability/:date` - Check availability
- `POST /api/bookings/quote` - Create booking from quote
- `PUT /api/bookings/:id` - Update booking
- `GET /api/bookings/:id/pdf` - Generate PDF

**Error Handling Pattern:**

1. **Input Validation:** Check required fields and formats before processing
2. **HTTP Status Codes:** 
   - `400` - Bad request (validation errors)
   - `404` - Not found
   - `500` - Server error
3. **Consistent Response Format:**
```typescript
// Success
{ success: true, message: '...', data: {...} }

// Error
{ success: false, message: '...', error: '...' }
```

4. **Try-Catch Blocks:** All async operations wrapped in try-catch
5. **User-Friendly Messages:** Error messages are clear and actionable
6. **Logging:** Errors logged to console for debugging

**Example:**
```typescript
router.post('/quote', async (req, res) => {
  try {
    // Validate
    if (!customer_name || !customer_email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    // Process...
    res.status(201).json({ success: true, booking_id: id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quote'
    });
  }
});
```

**Frontend Error Handling:**
- Service layer catches API errors
- Displays user-friendly messages
- Logs detailed errors for debugging
- Prevents double-submissions with loading states"

**Code Reference:**
```804:929:node-api/src/routes/bookings.ts
// POST endpoint for creating a quote with multiple items
router.post('/quote', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      event_date,
      event_start_time,
      event_end_time,
      organization_name,
      event_address,
      event_surface,
      event_is_indoor,
      items, // Array of items: [{ product_name, quantity, unit_price, product_category }]
      subtotal_amount,
      tax_amount,
      total_amount
    } = req.body;

    // Validate required fields
    if (!customer_name || !customer_email || !customer_phone || !event_date || !event_start_time || !event_end_time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customer_name, customer_email, customer_phone, event_date, event_start_time, event_end_time'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Validate email
    if (!emailRegex.test(customer_email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Calculate totals if not provided
    const calculatedSubtotal = subtotal_amount || items.reduce((sum, item) => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.unit_price || 0);
      return sum + (qty * price);
    }, 0);

    const calculatedTax = tax_amount || (calculatedSubtotal * 0.10); // 10% tax
    const calculatedTotal = total_amount || (calculatedSubtotal + calculatedTax);

    // Insert booking and get the booking ID
    // Note: bounce_house_type is nullable in schema, but we'll set it to a default or first item name
    const firstItemName = items.length > 0 ? items[0].product_name : 'Multiple Items';
    
    const bookingResult = await new Promise<{ lastID: number }>((resolve, reject) => {
      database.instance.run(
        `INSERT INTO bookings (
          customer_name, customer_email, customer_phone,
          event_date, event_start_time, event_end_time,
          bounce_house_type,
          organization_name, event_address, event_surface, event_is_indoor,
          subtotal_amount, tax_amount, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customer_name.trim(),
          customer_email.trim(),
          customer_phone.trim(),
          event_date,
          event_start_time,
          event_end_time,
          firstItemName, // Set bounce_house_type to first item name or default
          parseStringOrNull(organization_name),
          parseStringOrNull(event_address),
          parseStringOrNull(event_surface),
          parseBooleanAsInt(event_is_indoor, null),
          calculatedSubtotal,
          calculatedTax,
          calculatedTotal
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID });
        }
      );
    });

    const bookingId = bookingResult.lastID;

    // Insert booking items
    for (const item of items) {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unit_price || 0);
      const totalPrice = quantity * unitPrice;

      await runStatement(
        `INSERT INTO booking_items (
          booking_id, product_name, product_category,
          quantity, unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          bookingId,
          item.product_name || item.name || 'Unknown',
          item.product_category || item.category || null,
          quantity,
          unitPrice,
          totalPrice
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Quote created successfully',
      booking_id: bookingId
    });

  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quote. Please try again.'
    });
  }
});
```

---

#### Q: "Why SQLite instead of PostgreSQL or MySQL?"

**Answer:**
"I chose SQLite for this project because:

1. **Zero Configuration:** No server setup, no connection strings - just a file
2. **Perfect for MVP:** Ideal for development and prototyping
3. **Easy Migration Path:** The schema is designed to easily migrate to PostgreSQL/MySQL - I use standard SQL with minimal SQLite-specific features
4. **File-Based:** Easy to backup, version control, and deploy
5. **ACID Compliant:** Still provides transaction support and data integrity

**When I'd Use PostgreSQL:**
- Production with multiple concurrent users
- Need for advanced features (full-text search, JSON queries)
- Horizontal scaling requirements
- Complex relationships and constraints

**Migration Strategy:**
The schema uses standard SQL types (TEXT, INTEGER, REAL) that map directly to PostgreSQL. I'd only need to:
- Change connection string
- Update data types if needed (REAL → DECIMAL for money)
- Add any PostgreSQL-specific optimizations

For this booking system, SQLite handles the workload perfectly, but I designed it with future scalability in mind."

---

## 📦 Project 2: Lawnly

### Tech Stack
- **Frontend:** React
- **API Integration:** RESTful APIs, async data fetching
- **Key Features:** External API consumption, data transformation, error handling

---

### Technical Questions & Answers

#### Q: "How do you handle API integration in React?"

**Answer:**
"I follow a service layer pattern for API integration:

**Key Patterns:**

1. **Service Layer:** Separate API calls from components
   - Components call service functions
   - Services handle data transformation
   - Centralized error handling

2. **Async/Await:** Use async/await for clean asynchronous code
   - Better error handling than callbacks
   - Easier to read and maintain

3. **Error Handling:** 
   - Try-catch blocks around API calls
   - User-friendly error messages
   - Fallback UI states

4. **Loading States:** 
   - Track loading state in components
   - Show spinners/loading indicators
   - Disable buttons during requests

5. **Data Transformation:**
   - Transform API responses to match component needs
   - Handle different response formats
   - Validate data before using

**Example Pattern:**
```typescript
// Service layer
export const fetchData = async (endpoint: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return transformData(data); // Transform to match app needs
  } catch (error) {
    console.error('API Error:', error);
    throw error; // Re-throw for component to handle
  }
};

// Component usage
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData('endpoint');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

**Benefits:**
- Separation of concerns
- Reusable API functions
- Centralized error handling
- Easy to test
- Easy to mock for testing"

---

#### Q: "How do you handle API errors and retries?"

**Answer:**
"I implement a multi-layered error handling strategy:

**1. Network Errors:**
- Check `response.ok` before processing
- Handle fetch rejections (network failures)
- Provide user-friendly messages

**2. HTTP Status Codes:**
- `400-499`: Client errors - show specific error messages
- `500-599`: Server errors - show generic message, log details
- `401`: Authentication errors - redirect to login

**3. Retry Logic:**
For critical operations, I implement exponential backoff:
```typescript
const fetchWithRetry = async (url: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

**4. Timeout Handling:**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  // Process response
} catch (error) {
  if (error.name === 'AbortError') {
    // Handle timeout
  }
}
```

**5. User Feedback:**
- Show error messages in UI
- Provide retry buttons
- Maintain form data on errors
- Log errors for debugging"

---

#### Q: "How do you optimize API calls and prevent unnecessary requests?"

**Answer:**
"I use several optimization techniques:

**1. Debouncing:**
For search inputs, debounce API calls:
```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useMemo(
  () => debounce((term) => {
    if (term) fetchSearchResults(term);
  }, 300),
  []
);
```

**2. Caching:**
- Store API responses in state/context
- Check cache before making new requests
- Set cache expiration times

**3. Request Deduplication:**
- Track in-flight requests
- Reuse pending promises
- Prevent duplicate simultaneous requests

**4. Conditional Fetching:**
- Only fetch when data is needed
- Use `useEffect` dependencies correctly
- Skip requests if data already exists

**5. Pagination:**
- Load data in chunks
- Implement infinite scroll or "load more"
- Reduce initial load time

**6. Memoization:**
- Use `useMemo` for expensive computations
- Use `useCallback` for stable function references
- Prevent unnecessary re-renders

**Example:**
```typescript
const [cache, setCache] = useState(new Map());

const fetchData = useCallback(async (key: string) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = await apiCall(key);
  setCache(prev => new Map(prev).set(key, data));
  return data;
}, [cache]);
```"

---

## 📦 Project 3: Voltage Divider

### Tech Stack
- **Language:** C++
- **Paradigm:** Object-Oriented Programming
- **Key Features:** Circuit modeling, OOP design patterns

---

### Technical Questions & Answers

#### Q: "Explain your object-oriented design for the voltage divider circuit."

**Answer:**
"I designed a class hierarchy that models electrical circuit components:

**Class Structure:**

1. **Base Component Class:**
   - Abstract base class for all circuit components
   - Virtual methods for calculations
   - Common properties (resistance, voltage, current)

2. **Resistor Class:**
   - Inherits from Component
   - Implements resistance calculations
   - Handles power dissipation

3. **VoltageDivider Class:**
   - Composition of two Resistor objects
   - Calculates output voltage based on input
   - Implements voltage division formula: Vout = Vin * (R2 / (R1 + R2))

**Key OOP Principles:**

1. **Encapsulation:** 
   - Private member variables
   - Public getter/setter methods
   - Data validation in setters

2. **Inheritance:**
   - Resistor extends Component
   - Code reuse and polymorphism

3. **Polymorphism:**
   - Virtual functions for different calculation methods
   - Interface-based design

4. **Abstraction:**
   - Hide implementation details
   - Expose only necessary interface

**Example Structure:**
```cpp
class Component {
protected:
    double resistance;
    double voltage;
    double current;
public:
    virtual double calculateVoltage() = 0;
    virtual double calculateCurrent() = 0;
};

class Resistor : public Component {
private:
    double tolerance;
public:
    Resistor(double r, double tol = 0.05);
    double calculateVoltage() override;
    double calculateCurrent() override;
    double getPowerDissipation();
};

class VoltageDivider {
private:
    Resistor r1;
    Resistor r2;
    double inputVoltage;
public:
    VoltageDivider(double r1_val, double r2_val, double vin);
    double getOutputVoltage();
    double getCurrent();
    void setInputVoltage(double vin);
};
```

**Benefits:**
- Modular and extensible
- Easy to add new component types
- Testable individual components
- Clear separation of concerns"

---

#### Q: "How do you handle precision and numerical errors in C++?"

**Answer:**
"I use several techniques to handle floating-point precision:

**1. Appropriate Data Types:**
- Use `double` instead of `float` for better precision
- Consider `long double` for critical calculations

**2. Comparison with Epsilon:**
```cpp
const double EPSILON = 1e-9;
bool isEqual(double a, double b) {
    return std::abs(a - b) < EPSILON;
}
```

**3. Rounding Strategies:**
- Round to significant digits for display
- Keep full precision for calculations
- Use `std::round()` or custom rounding functions

**4. Error Propagation:**
- Track error bounds through calculations
- Use error analysis for critical measurements

**5. Validation:**
- Check for division by zero
- Validate input ranges
- Handle edge cases (infinite resistance, zero voltage)

**Example:**
```cpp
double VoltageDivider::getOutputVoltage() {
    double totalResistance = r1.getResistance() + r2.getResistance();
    if (std::abs(totalResistance) < EPSILON) {
        throw std::runtime_error("Total resistance cannot be zero");
    }
    return inputVoltage * (r2.getResistance() / totalResistance);
}
```

**6. Unit Testing:**
- Test with known values
- Compare against theoretical calculations
- Test edge cases and boundary conditions"

---

#### Q: "What design patterns did you use in your C++ project?"

**Answer:**
"I implemented several design patterns:

**1. Strategy Pattern:**
- Different calculation strategies for different circuit types
- Interchangeable algorithms

**2. Factory Pattern:**
- Create component objects based on type
- Centralized object creation

**3. Observer Pattern (if implemented):**
- Notify when circuit values change
- Update dependent calculations

**4. Singleton Pattern (if needed):**
- Single instance for circuit simulator
- Global configuration

**Example Factory:**
```cpp
class ComponentFactory {
public:
    static std::unique_ptr<Component> createComponent(
        ComponentType type, 
        double value
    ) {
        switch(type) {
            case ComponentType::RESISTOR:
                return std::make_unique<Resistor>(value);
            case ComponentType::CAPACITOR:
                return std::make_unique<Capacitor>(value);
            default:
                throw std::invalid_argument("Unknown component type");
        }
    }
};
```

**Benefits:**
- Flexible and extensible
- Easy to add new component types
- Decoupled code
- Testable components"

---

## 🎯 Cross-Project Questions

#### Q: "How do you approach debugging across different technologies?"

**Answer:**
"I use a systematic debugging approach:

**1. Reproduce the Issue:**
- Identify steps to reproduce
- Check if it's consistent or intermittent
- Note environment details

**2. Isolate the Problem:**
- Use binary search to narrow down
- Comment out code sections
- Test individual components

**3. Use Appropriate Tools:**
- **React:** React DevTools, browser DevTools, console.log
- **Node.js:** Debugger, console.log, error stack traces
- **C++:** GDB debugger, valgrind, print statements

**4. Check Logs:**
- Server logs for backend issues
- Browser console for frontend
- Application logs for C++

**5. Verify Assumptions:**
- Check data types and values
- Verify API responses
- Validate input data

**6. Test Incrementally:**
- Start with simplest case
- Add complexity gradually
- Test edge cases

**7. Document Findings:**
- Note what works and what doesn't
- Keep track of attempted solutions
- Document root cause when found"

---

#### Q: "How do you ensure code quality across projects?"

**Answer:**
"I follow consistent practices:

**1. Code Organization:**
- Clear file structure
- Separation of concerns
- Modular design

**2. Naming Conventions:**
- Descriptive variable/function names
- Consistent naming patterns
- Follow language conventions

**3. Documentation:**
- Comments for complex logic
- README files
- API documentation

**4. Type Safety:**
- TypeScript for JavaScript projects
- Strong typing in C++
- Type checking and validation

**5. Error Handling:**
- Comprehensive error handling
- User-friendly error messages
- Logging for debugging

**6. Testing:**
- Unit tests for critical functions
- Integration tests for workflows
- Manual testing for UI

**7. Code Review:**
- Self-review before committing
- Check for common mistakes
- Refactor when needed

**8. Version Control:**
- Meaningful commit messages
- Feature branches
- Clean git history"

---

#### Q: "How do you handle state management in different projects?"

**Answer:**
"I choose state management based on project needs:

**React Projects (Lawnly, NWA Jumpers):**
- **Simple State:** `useState` for component-level state
- **Global State:** Context API or prop drilling for small apps
- **Complex State:** Consider Redux or Zustand for larger apps
- **Server State:** React Query for API data caching

**C++ Projects (Voltage Divider):**
- **Member Variables:** Class state in private members
- **Static State:** Class-level constants and shared state
- **Global State:** Minimize, use singletons if needed
- **State Machines:** For complex state transitions

**Key Principles:**
1. **Minimize State:** Only store what's necessary
2. **Single Source of Truth:** Avoid duplicate state
3. **Immutable Updates:** Create new objects/arrays
4. **Predictable Updates:** Clear state update patterns
5. **Performance:** Avoid unnecessary re-renders/recalculations"

---

## 🚀 Quick Reference: Key Talking Points

### NWA Jumpers
- ✅ Full-stack implementation (React + Node.js)
- ✅ SQLite with normalized schema
- ✅ RESTful API design
- ✅ Real-time form validation
- ✅ PDF generation
- ✅ TypeScript throughout

### Lawnly
- ✅ React API integration patterns
- ✅ Service layer architecture
- ✅ Error handling strategies
- ✅ Loading states and UX

### Voltage Divider
- ✅ Object-oriented design
- ✅ C++ best practices
- ✅ Numerical precision handling
- ✅ Design patterns implementation

---

## 💡 Final Tips

1. **Be Specific:** Use code examples and file references
2. **Show Problem-Solving:** Explain challenges and solutions
3. **Demonstrate Growth:** Discuss what you learned
4. **Connect to Role:** Relate projects to job requirements
5. **Be Honest:** Admit limitations and discuss improvements
6. **Show Enthusiasm:** Be excited about your work!

---

**Good luck with your technical interviews! 🎯**






