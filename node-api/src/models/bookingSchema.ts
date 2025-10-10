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
    bounce_house_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
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
  bounce_house_type: string;
  created_at?: string;
}

