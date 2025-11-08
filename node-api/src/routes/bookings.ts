import express from 'express';
import { Booking, getBookingsOrderedByDateQuery } from '../models/bookingSchema';
import { database } from '../database';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Get bookings ordered by event date (for admin calendar view)
    const bookings = await database.all(getBookingsOrderedByDateQuery);
    res.json(bookings as Booking[]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' as string });
  }
});

// New endpoint to check availability for a specific date
router.get('/availability/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Use the raw database instance for parameterized queries
    const query = `SELECT * FROM bookings WHERE event_date = ?`;
    const bookings = await new Promise<Booking[]>((resolve, reject) => {
      database.instance.all(query, [date], (err, rows) => {
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

router.post('/', async (req, res) => {
  try {
    // Input validation
    const { customer_name, customer_email, customer_phone, event_date, event_start_time, event_end_time, bounce_house_type } = req.body;
    
    // Check required fields
    if (!customer_name || !customer_email || !customer_phone || !event_date || !event_start_time || !event_end_time || !bounce_house_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields. Please provide: customer_name, customer_email, customer_phone, event_date, event_start_time, event_end_time, bounce_house_type' 
      });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }
    
    // Insert booking into database
    const result = await database.instance.run(
      'INSERT INTO bookings (customer_name, customer_email, customer_phone, event_date, event_start_time, event_end_time, bounce_house_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer_name, customer_email, customer_phone, event_date, event_start_time, event_end_time, bounce_house_type]
    );
    
    // Return success response with booking ID
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking_id: (result as any).lastID
    });
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create booking. Please try again.' 
    });
  }
});

export default router;