import express from 'express';
import PDFDocument from 'pdfkit';
import type PDFKit from 'pdfkit';
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

const formatCurrency = (value: number | null | undefined, fallback = '$0.00'): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback;
  }
  const rounded = Number(value);
  return `$${rounded.toFixed(2)}`;
};

const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return `${Number(value).toFixed(2)}%`;
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return 'Not specified';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString();
};

const formatTime = (value: string | null | undefined): string => {
  if (!value) {
    return '—';
  }
  const [hours, minutes] = value.split(':');
  if (!hours) return value;
  const date = new Date();
  date.setHours(Number(hours), Number(minutes ?? 0), 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const formatEventTimeRange = (start: string | null | undefined, end: string | null | undefined): string => {
  const startStr = formatTime(start);
  const endStr = formatTime(end);
  if (startStr === '—' && endStr === '—') {
    return 'Not specified';
  }
  if (startStr === '—') {
    return `Until ${endStr}`;
  }
  if (endStr === '—') {
    return `${startStr} (end TBD)`;
  }
  return `${startStr} – ${endStr}`;
};

const formatYesNo = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return 'Not specified';
  }
  return value === 1 ? 'Yes' : 'No';
};

const calculateItemTotal = (item: BookingItem): number => {
  const quantity = Number(item.quantity ?? 0);
  const unitPrice = Number(item.unit_price ?? 0);
  const explicitTotal = Number(item.total_price ?? 0);
  if (!Number.isNaN(explicitTotal) && explicitTotal !== 0) {
    return explicitTotal;
  }
  return Number((quantity * unitPrice).toFixed(2));
};

const renderRentalAgreementPdf = (doc: PDFKit.PDFDocument, booking: Booking, items: BookingItem[]) => {
  const margin = 36;
  const lineHeight = 18;
  const pageWidth = doc.page.width - margin * 2;
  let cursorY = margin;

  const drawSectionTitle = (title: string) => {
    doc.font('Helvetica-Bold').fontSize(12).text(title, margin, cursorY);
    cursorY += lineHeight;
    doc.moveTo(margin, cursorY - 4).lineTo(margin + pageWidth, cursorY - 4).strokeColor('#475569').lineWidth(0.5).stroke();
  };

  const drawKeyValueRow = (rows: Array<[string, string]>, options?: { columns?: number }) => {
    const columns = options?.columns ?? rows.length;
    const columnWidth = pageWidth / columns;
    doc.font('Helvetica').fontSize(10);

    rows.forEach(([key, value], idx) => {
      const x = margin + columnWidth * (idx % columns);
      const y = cursorY + Math.floor(idx / columns) * lineHeight;
      doc.font('Helvetica-Bold').text(`${key}: `, x, y, { continued: true });
      doc.font('Helvetica').text(value);
    });

    const rowsCount = Math.ceil(rows.length / columns);
    cursorY += rowsCount * lineHeight;
    cursorY += 4;
  };

  const drawTable = (headers: string[], rows: string[][]) => {
    const columnWidths = headers.map((_, idx) => {
      if (idx === headers.length - 1) {
        return pageWidth - (headers.length - 1) * (pageWidth / headers.length);
      }
      return pageWidth / headers.length;
    });

    doc.font('Helvetica-Bold').fontSize(10);
    let x = margin;
    headers.forEach((header, idx) => {
      doc.text(header, x, cursorY, { width: columnWidths[idx], underline: false });
      x += columnWidths[idx];
    });
    cursorY += lineHeight;
    doc.moveTo(margin, cursorY - 4).lineTo(margin + pageWidth, cursorY - 4).strokeColor('#475569').lineWidth(0.5).stroke();

    doc.font('Helvetica').fontSize(10);
    rows.forEach((row) => {
      let rowX = margin;
      row.forEach((cell, idx) => {
        doc.text(cell, rowX, cursorY, { width: columnWidths[idx] });
        rowX += columnWidths[idx];
      });
      cursorY += lineHeight;
    });

    cursorY += 6;
  };

  const ensureSpace = (height: number) => {
    if (cursorY + height > doc.page.height - margin * 2) {
      doc.addPage();
      cursorY = margin;
    }
  };

  const submittedAt = booking.created_at ?? new Date().toISOString();

  doc.font('Helvetica-Bold').fontSize(24).text('NWA Jumpers', margin, cursorY);
  cursorY += lineHeight;

  doc.font('Helvetica').fontSize(10).text('A Division of CR Communications LLC', margin, cursorY);
  cursorY += lineHeight;
  doc.text('(479) 696-4040 | Rentals Agreement', margin, cursorY);
  cursorY += lineHeight;
  doc.text('Website: www.nwajumpers.com | Email: info@nwajumpers.com', margin, cursorY);
  cursorY += lineHeight * 1.5;

  doc.font('Helvetica').fontSize(10).text(`Generated: ${new Date(submittedAt).toLocaleString()}`, margin, cursorY, { align: 'right', width: pageWidth });
  cursorY += lineHeight;
  doc.text(`Booking ID: ${booking.id ?? '—'}`, margin, cursorY, { align: 'right', width: pageWidth });
  cursorY += lineHeight * 1.2;

  ensureSpace(lineHeight * 6);
  drawSectionTitle('Customer & Event');
  drawKeyValueRow([
    ['Customer', booking.customer_name ?? '—'],
    ['Organization', booking.organization_name ?? '—'],
    ['Phone', booking.customer_phone ?? '—'],
    ['Email', booking.customer_email ?? '—'],
  ], { columns: 2 });

  drawKeyValueRow([
    ['Event Date', formatDate(booking.event_date)],
    ['Setup Date', formatDate(booking.setup_date)],
    ['Event Time', formatEventTimeRange(booking.event_start_time, booking.event_end_time)],
    ['Delivery Window', booking.delivery_window ?? '—'],
    ['After Hours', booking.after_hours_window ?? '—'],
    ['Indoor', formatYesNo(booking.event_is_indoor)],
  ], { columns: 2 });

  drawKeyValueRow([
    ['Event Address', booking.event_address ?? '—'],
    ['Surface Type', booking.event_surface ?? '—'],
  ], { columns: 1 });

  ensureSpace(lineHeight * 6);
  const lineItemRows = items.length > 0
    ? items.map((item, index) => [
        String(index + 1),
        item.product_name ?? '—',
        item.product_category ?? '—',
        String(item.quantity ?? 1),
        formatCurrency(item.unit_price ?? 0),
        formatCurrency(calculateItemTotal(item)),
      ])
    : [
        ['1', booking.bounce_house_type ?? 'Bounce House', 'Primary', '1', formatCurrency(booking.subtotal_amount ?? 0), formatCurrency(booking.subtotal_amount ?? 0)],
      ];

  drawSectionTitle('Line Items');
  drawTable(
    ['#', 'Product', 'Category', 'Qty', 'Unit Price', 'Total'],
    lineItemRows
  );

  ensureSpace(lineHeight * 6);
  const subtotal = booking.subtotal_amount ?? lineItemRows.reduce((sum, row) => sum + Number(row[5].replace(/[^0-9.-]+/g, '')), 0);
  const deliveryFee = booking.delivery_fee ?? 0;
  const taxAmount = booking.tax_amount ?? 0;
  const totalAmount = booking.total_amount ?? subtotal + deliveryFee + taxAmount;
  const deposit = booking.deposit_amount ?? 0;
  const balance = booking.balance_due ?? totalAmount - deposit;

  drawSectionTitle('Cost Summary');
  drawKeyValueRow([
    ['Subtotal', formatCurrency(subtotal)],
    ['Discount', booking.discount_percent !== null && booking.discount_percent !== undefined ? formatPercent(booking.discount_percent) : '—'],
    ['Delivery Fee', formatCurrency(deliveryFee)],
    ['Tax (est.)', formatCurrency(taxAmount)],
    ['Total', formatCurrency(totalAmount)],
    ['Deposit', formatCurrency(deposit)],
    ['Balance Due', formatCurrency(balance)],
    ['Payment Method', booking.payment_method ?? '—'],
  ], { columns: 2 });

  ensureSpace(lineHeight * 6);
  drawSectionTitle('Notes & Internal Information');
  doc.font('Helvetica').fontSize(10).text(
    booking.internal_notes && booking.internal_notes.trim().length > 0
      ? booking.internal_notes
      : 'No internal notes recorded.',
    margin,
    cursorY,
    { width: pageWidth }
  );
  cursorY += lineHeight * 3;

  ensureSpace(lineHeight * 12);
  drawSectionTitle('Rental Agreement & Liability Waiver');
  const waiverParagraphs = [
    'It is the responsibility of the person(s) or organization hiring this inflatable equipment to ensure that all possible precautions are taken to avoid injury to people or damage to the inflatable. The following safety instructions are to be obeyed at all times:',
    '1) No food, drink or chewing gum on or around the inflatable. This will avoid choking and keep the unit clean.',
    '2) Shoes, glasses, jewelry, badges MUST be removed before using the inflatable.',
    '3) Do not push, collide, fight or behave in a manner likely to injure or cause distress to others.',
    '4) No pets, toys or sharp instruments on the inflatable at any time.',
    '5) No smoking or fires near the inflatable.',
    '6) Adult supervision is required at all times. The lessee is responsible for enforcing safety rules.',
    '7) The blower must be turned off in high winds or stormy weather and the unit vacated.',
    '8) The lessee agrees to pay in full for any damage to the inflatable due to negligence.',
  ];

  doc.font('Helvetica').fontSize(9);
  waiverParagraphs.forEach((paragraph) => {
    ensureSpace(lineHeight * 2);
    doc.text(paragraph, margin, cursorY, { width: pageWidth, lineGap: 2 });
    cursorY += lineHeight * (paragraph.startsWith('1') ? 1.2 : 1);
  });

  ensureSpace(lineHeight * 4);
  doc.font('Helvetica-Bold').text('Tax Notice:', margin, cursorY);
  cursorY += lineHeight;
  doc.font('Helvetica').text(
    'According to the state of Arkansas rentals are subject to a 10% tax. De acuerdo al estado de Arkansas cualquier tipo de renta o alquiler está sujeto a un 10% tax.',
    margin,
    cursorY,
    { width: pageWidth }
  );
  cursorY += lineHeight * 2;

  ensureSpace(lineHeight * 3);
  doc.moveTo(margin, cursorY).lineTo(margin + pageWidth / 2, cursorY).strokeColor('#475569').stroke();
  doc.moveTo(margin + pageWidth / 2 + 40, cursorY).lineTo(margin + pageWidth, cursorY).stroke();
  cursorY += 6;
  doc.font('Helvetica').text('Signature (after reading rules)', margin, cursorY);
  doc.text('Date', margin + pageWidth / 2 + 40, cursorY);
  cursorY += lineHeight * 2;

  doc.text(`Printed Name: ____________________________`, margin, cursorY);
  cursorY += lineHeight * 2;

  doc.text('Thank you for choosing NWA Jumpers!', margin, cursorY, { align: 'center', width: pageWidth });

  doc.end();
};

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
    const safeName = (booking.customer_name ?? 'booking').replace(/\s+/g, '-').toLowerCase();
    res.setHeader('Content-Disposition', `attachment; filename=booking-${booking.id}-${safeName}.pdf`);

    const doc = new PDFDocument({ margin: 36, size: 'LETTER' });
    doc.pipe(res);

    renderRentalAgreementPdf(doc, booking, items);
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