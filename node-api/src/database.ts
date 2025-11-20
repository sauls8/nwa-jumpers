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

