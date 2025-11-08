import express from 'express';
import PDFDocument from 'pdfkit';
import { 
  Booking, 
  getBookingByIdQuery, 
  getBookingsByDateQuery, 
  getBookingsOrderedByDateQuery 
} from '../models/bookingSchema';
import { database } from '../database';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Get bookings ordered by event date (for admin calendar view)
    const bookings = await database.all(getBookingsOrderedByDateQuery) as Booking[];
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' as string });
  }
});

// Admin: get all bookings for a specific date
router.get('/by-date/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const bookings = await new Promise<Booking[]>((resolve, reject) => {
      database.instance.all(getBookingsByDateQuery, [date], (err, rows) => {
        if (err) reject(err);
        else resolve(rows as Booking[]);
      });
    });

    res.json({
      date,
      bookings
    });
  } catch (error) {
    console.error('Bookings by date error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings for date' });
  }
});

// New endpoint to check availability for a specific date
router.get('/availability/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    const bookings = await new Promise<Booking[]>((resolve, reject) => {
      database.instance.all(getBookingsByDateQuery, [date], (err, rows) => {
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

// Admin: generate PDF summary for a booking
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await new Promise<Booking | undefined>((resolve, reject) => {
      database.instance.get(getBookingByIdQuery, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row as Booking | undefined);
      });
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=booking-${booking.id}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    const eventStart = booking.event_start_time ?? 'Not specified';
    const eventEnd = booking.event_end_time ?? 'Not specified';
    const eventTimeLabel = `${eventStart} - ${eventEnd}`;
    const submittedAt = booking.created_at ?? 'N/A';

    doc.fontSize(20).text('NWA Jumpers Booking Summary', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Booking ID: ${booking.id}`);
    doc.text(`Created: ${submittedAt}`);
    doc.moveDown();

    doc.text('Customer Details', { underline: true });
    doc.text(`Name: ${booking.customer_name}`);
    doc.text(`Email: ${booking.customer_email}`);
    doc.text(`Phone: ${booking.customer_phone}`);
    doc.moveDown();

    doc.text('Event Details', { underline: true });
    doc.text(`Event Date: ${booking.event_date}`);
    doc.text(`Event Time: ${eventTimeLabel}`);
    doc.text(`Bounce House: ${booking.bounce_house_type}`);
    doc.moveDown();

    doc.text('Notes', { underline: true });
    doc.text('Please review this booking with the customer prior to the delivery date.');
    doc.text('Bring this summary on-site for quick reference and signature capture if needed.');

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate booking PDF' });
    } else {
      res.end();
    }
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