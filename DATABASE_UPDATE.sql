-- Database Migration: Add missing columns to bookings table
-- Run this SQL manually to update your existing database

-- Add organization_name column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN organization_name TEXT;

-- Add event_address column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN event_address TEXT;

-- Add event_surface column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN event_surface TEXT;

-- Add event_is_indoor column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN event_is_indoor INTEGER;

-- Add invoice_number column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN invoice_number TEXT;

-- Add contract_number column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN contract_number TEXT;

-- Add setup_date column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN setup_date TEXT;

-- Add delivery_window column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN delivery_window TEXT;

-- Add after_hours_window column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN after_hours_window TEXT;

-- Add discount_percent column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN discount_percent REAL;

-- Add subtotal_amount column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN subtotal_amount REAL;

-- Add delivery_fee column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN delivery_fee REAL;

-- Add tax_amount column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN tax_amount REAL;

-- Add total_amount column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN total_amount REAL;

-- Add deposit_amount column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN deposit_amount REAL;

-- Add balance_due column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN balance_due REAL;

-- Add payment_method column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN payment_method TEXT;

-- Add internal_notes column (if it doesn't exist)
ALTER TABLE bookings ADD COLUMN internal_notes TEXT;

