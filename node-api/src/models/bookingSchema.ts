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
    event_start_time TEXT NOT NULL,
    event_end_time TEXT NOT NULL,
    bounce_house_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  event_start_time: string | null;
  event_end_time: string | null;
  bounce_house_type: string;
  created_at?: string;
}

