/**
 * Booking Schema Definition
 * Defines the structure of the bookings table
 */

export const createBookingsTableQuery = `
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_start_time TEXT,
    event_end_time TEXT,
    bounce_house_type TEXT,
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
`;

export const createBookingItemsTableQuery = `
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
  )
`;

// Query to get bookings ordered by date (for admin view)
export const getBookingsOrderedByDateQuery = `
  SELECT * FROM bookings 
  ORDER BY event_date ASC, created_at DESC
`;

// Query to check if a specific date is booked
export const getBookingsByDateQuery = `
  SELECT * FROM bookings 
  WHERE event_date = ?
  ORDER BY event_start_time ASC, created_at DESC
`;

export const getBookingByIdQuery = `
  SELECT * FROM bookings
  WHERE id = ?
`;

/**
 * TypeScript interface for type safety
 */
export interface Booking {
  id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string;
  event_start_time?: string | null;
  event_end_time?: string | null;
  bounce_house_type?: string | null;
  organization_name?: string | null;
  event_address?: string | null;
  event_surface?: string | null;
  event_is_indoor?: number | null;
  invoice_number?: string | null;
  contract_number?: string | null;
  setup_date?: string | null;
  delivery_window?: string | null;
  after_hours_window?: string | null;
  discount_percent?: number | null;
  subtotal_amount?: number | null;
  delivery_fee?: number | null;
  tax_amount?: number | null;
  total_amount?: number | null;
  deposit_amount?: number | null;
  balance_due?: number | null;
  payment_method?: string | null;
  internal_notes?: string | null;
  created_at?: string;
  items?: BookingItem[];
}

export interface BookingItem {
  id?: number;
  booking_id: number;
  quantity: number;
  unit_price: number;
  product_name: string;
  product_category?: string | null;
  total_price: number;
  notes?: string | null;
}

