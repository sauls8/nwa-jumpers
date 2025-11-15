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
 * Initialize the database by creating tables
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await dbRun(createBookingsTableQuery);
    await dbRun(createBookingItemsTableQuery);
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

