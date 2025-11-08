import express from 'express';
import PDFDocument from 'pdfkit';
import { 
  Booking, 
  type BookingItem,
  getBookingByIdQuery, 
  getBookingsByDateQuery, 
  getBookingsOrderedByDateQuery 
} from '../models/bookingSchema';
import { database } from '../database';

const router = express.Router();

const runStatement = (query: string, params: unknown[] = []): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    database.instance.run(query, params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const fetchBookingById = async (id: number): Promise<Booking | undefined> => {
  const result = await new Promise<Booking | undefined>((resolve, reject) => {
    database.instance.get(getBookingByIdQuery, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row as Booking | undefined);
    });
  });
  return result;
};

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

const attachItemsToBookings = async (bookings: Booking[]): Promise<Booking[]> => {
  const ids = bookings
    .map((booking) => booking.id)
    .filter((id): id is number => typeof id === 'number');

  const grouped = await fetchBookingItemsByBookingIds(ids);

  return bookings.map((booking) => ({
    ...booking,
    items: grouped.get(booking.id ?? 0) ?? [],
  }));
};

const parseNumberOrNull = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const parseStringOrNull = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null;
  }
  const str = String(value).trim();
  return str.length > 0 ? str : null;
};

const parseBooleanAsInt = (value: unknown, fallback: number | null): number | null => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (typeof value === 'number') {
    return value === 0 ? 0 : 1;
  }
  const normalized = String(value).trim().toLowerCase();
  if (['true', 'yes', '1'].includes(normalized)) {
    return 1;
  }
  if (['false', 'no', '0'].includes(normalized)) {
    return 0;
  }
  return fallback;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hasProp = (obj: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

router.get('/', async (req, res) => {
  try {
    // Get bookings ordered by event date (for admin calendar view)
    const bookings = await database.all(getBookingsOrderedByDateQuery) as Booking[];
    const enrichedBookings = await attachItemsToBookings(bookings);
    res.json(enrichedBookings);
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
    const enrichedBookings = await attachItemsToBookings(bookings);

    res.json({
      date,
      bookings: enrichedBookings
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

// Admin: get single booking with all admin details and items
router.get('/:id', async (req, res) => {
  const bookingId = Number(req.params.id);

  if (Number.isNaN(bookingId)) {
    return res.status(400).json({ error: 'Invalid booking ID' });
  }

  try {
    const booking = await fetchBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const [enrichedBooking] = await attachItemsToBookings([booking]);

    res.json(enrichedBooking);
  } catch (error) {
    console.error(`Error fetching booking ${bookingId}:`, error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Admin: update booking details and line items
router.put('/:id', async (req, res) => {
  const bookingId = Number(req.params.id);

  if (Number.isNaN(bookingId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking ID',
    });
  }

  try {
    const existingBooking = await fetchBookingById(bookingId);

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const payload: Record<string, unknown> = req.body ?? {};

    const customerName =
      (hasProp(payload, 'customer_name') ? parseStringOrNull(payload.customer_name) : null) ??
      existingBooking.customer_name;
    const customerEmail =
      (hasProp(payload, 'customer_email') ? parseStringOrNull(payload.customer_email) : null) ??
      existingBooking.customer_email;
    const customerPhone =
      (hasProp(payload, 'customer_phone') ? parseStringOrNull(payload.customer_phone) : null) ??
      existingBooking.customer_phone;
    const eventDate =
      (hasProp(payload, 'event_date') ? parseStringOrNull(payload.event_date) : null) ??
      existingBooking.event_date;
    const eventStartTime = hasProp(payload, 'event_start_time')
      ? parseStringOrNull(payload.event_start_time)
      : existingBooking.event_start_time ?? null;
    const eventEndTime = hasProp(payload, 'event_end_time')
      ? parseStringOrNull(payload.event_end_time)
      : existingBooking.event_end_time ?? null;
    const bounceHouseType = hasProp(payload, 'bounce_house_type')
      ? parseStringOrNull(payload.bounce_house_type)
      : existingBooking.bounce_house_type ?? null;

    if (customerEmail && !emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    const organizationName = hasProp(payload, 'organization_name')
      ? parseStringOrNull(payload.organization_name)
      : existingBooking.organization_name ?? null;
    const eventAddress = hasProp(payload, 'event_address')
      ? parseStringOrNull(payload.event_address)
      : existingBooking.event_address ?? null;
    const eventSurface = hasProp(payload, 'event_surface')
      ? parseStringOrNull(payload.event_surface)
      : existingBooking.event_surface ?? null;
    const eventIsIndoor = hasProp(payload, 'event_is_indoor')
      ? parseBooleanAsInt(payload.event_is_indoor, existingBooking.event_is_indoor ?? null)
      : existingBooking.event_is_indoor ?? null;
    const invoiceNumber = hasProp(payload, 'invoice_number')
      ? parseStringOrNull(payload.invoice_number)
      : existingBooking.invoice_number ?? null;
    const contractNumber = hasProp(payload, 'contract_number')
      ? parseStringOrNull(payload.contract_number)
      : existingBooking.contract_number ?? null;
    const setupDate = hasProp(payload, 'setup_date')
      ? parseStringOrNull(payload.setup_date)
      : existingBooking.setup_date ?? null;
    const deliveryWindow = hasProp(payload, 'delivery_window')
      ? parseStringOrNull(payload.delivery_window)
      : existingBooking.delivery_window ?? null;
    const afterHoursWindow = hasProp(payload, 'after_hours_window')
      ? parseStringOrNull(payload.after_hours_window)
      : existingBooking.after_hours_window ?? null;
    const discountPercent = hasProp(payload, 'discount_percent')
      ? parseNumberOrNull(payload.discount_percent)
      : existingBooking.discount_percent ?? null;
    const subtotalAmount = hasProp(payload, 'subtotal_amount')
      ? parseNumberOrNull(payload.subtotal_amount)
      : existingBooking.subtotal_amount ?? null;
    const deliveryFee = hasProp(payload, 'delivery_fee')
      ? parseNumberOrNull(payload.delivery_fee)
      : existingBooking.delivery_fee ?? null;
    const taxAmount = hasProp(payload, 'tax_amount')
      ? parseNumberOrNull(payload.tax_amount)
      : existingBooking.tax_amount ?? null;
    const totalAmount = hasProp(payload, 'total_amount')
      ? parseNumberOrNull(payload.total_amount)
      : existingBooking.total_amount ?? null;
    const depositAmount = hasProp(payload, 'deposit_amount')
      ? parseNumberOrNull(payload.deposit_amount)
      : existingBooking.deposit_amount ?? null;
    const balanceDue = hasProp(payload, 'balance_due')
      ? parseNumberOrNull(payload.balance_due)
      : existingBooking.balance_due ?? null;
    const paymentMethod = hasProp(payload, 'payment_method')
      ? parseStringOrNull(payload.payment_method)
      : existingBooking.payment_method ?? null;
    const internalNotes = hasProp(payload, 'internal_notes')
      ? parseStringOrNull(payload.internal_notes)
      : existingBooking.internal_notes ?? null;

    await runStatement(
      `
        UPDATE bookings SET
          customer_name = ?,
          customer_email = ?,
          customer_phone = ?,
          event_date = ?,
          event_start_time = ?,
          event_end_time = ?,
          bounce_house_type = ?,
          organization_name = ?,
          event_address = ?,
          event_surface = ?,
          event_is_indoor = ?,
          invoice_number = ?,
          contract_number = ?,
          setup_date = ?,
          delivery_window = ?,
          after_hours_window = ?,
          discount_percent = ?,
          subtotal_amount = ?,
          delivery_fee = ?,
          tax_amount = ?,
          total_amount = ?,
          deposit_amount = ?,
          balance_due = ?,
          payment_method = ?,
          internal_notes = ?
        WHERE id = ?
      `,
      [
        customerName,
        customerEmail,
        customerPhone,
        eventDate,
        eventStartTime,
        eventEndTime,
        bounceHouseType,
        organizationName,
        eventAddress,
        eventSurface,
        eventIsIndoor,
        invoiceNumber,
        contractNumber,
        setupDate,
        deliveryWindow,
        afterHoursWindow,
        discountPercent,
        subtotalAmount,
        deliveryFee,
        taxAmount,
        totalAmount,
        depositAmount,
        balanceDue,
        paymentMethod,
        internalNotes,
        bookingId,
      ]
    );

    if (Array.isArray(payload.items)) {
      await runStatement('DELETE FROM booking_items WHERE booking_id = ?', [bookingId]);

      // Insert refreshed item list
      for (const rawItem of payload.items as Record<string, unknown>[]) {
        const productName = parseStringOrNull(rawItem.product_name);
        if (!productName) {
          continue;
        }
        const quantity = parseNumberOrNull(rawItem.quantity) ?? 1;
        const unitPrice = parseNumberOrNull(rawItem.unit_price) ?? 0;
        const totalPrice =
          parseNumberOrNull(rawItem.total_price) ?? Number((quantity * unitPrice).toFixed(2));
        const productCategory = parseStringOrNull(rawItem.product_category);
        const notes = parseStringOrNull(rawItem.notes);

        await runStatement(
          'INSERT INTO booking_items (booking_id, quantity, unit_price, product_name, product_category, total_price, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [bookingId, quantity, unitPrice, productName, productCategory, totalPrice, notes]
        );
      }
    }

    const refreshedBooking = await fetchBookingById(bookingId);
    if (!refreshedBooking) {
      throw new Error('Failed to fetch booking after update');
    }

    const [enrichedBooking] = await attachItemsToBookings([refreshedBooking]);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking: enrichedBooking,
    });
  } catch (error) {
    console.error(`Error updating booking ${bookingId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
    });
  }
});

// Admin: generate PDF summary for a booking
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await fetchBookingById(Number(id));

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const [bookingWithItems] = await attachItemsToBookings([booking]);
    const items = bookingWithItems?.items ?? [];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=booking-${booking.id}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    const eventStart = booking.event_start_time ?? 'Not specified';
    const eventEnd = booking.event_end_time ?? 'Not specified';
    const eventTimeLabel = `${eventStart} - ${eventEnd}`;
    const submittedAt = booking.created_at ?? 'N/A';
    const organization = booking.organization_name ?? 'Not specified';
    const address = booking.event_address ?? 'Not specified';
    const deliveryWindow = booking.delivery_window ?? 'Not specified';

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
    doc.text(`Organization: ${organization}`);
    doc.moveDown();

    doc.text('Event Details', { underline: true });
    doc.text(`Event Date: ${booking.event_date}`);
    doc.text(`Event Time: ${eventTimeLabel}`);
    doc.text(`Bounce House: ${booking.bounce_house_type}`);
    doc.text(`Event Address: ${address}`);
    doc.text(`Delivery Window: ${deliveryWindow}`);
    doc.moveDown();

    if (items.length > 0) {
      doc.text('Line Items', { underline: true });
      items.forEach((item, index) => {
        const total = item.total_price ?? item.quantity * item.unit_price;
        doc.text(
          `${index + 1}. ${item.product_name} (x${item.quantity}) - $${total.toFixed(2)}`
        );
      });
      doc.moveDown();
    }

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