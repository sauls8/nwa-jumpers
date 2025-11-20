import { getApiUrl } from '../config/api';

export interface AdminBooking {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string;
  event_start_time: string | null;
  event_end_time: string | null;
  bounce_house_type: string | null;
  organization_name: string | null;
  event_address: string | null;
  event_surface: string | null;
  event_is_indoor: number | null;
  invoice_number: string | null;
  contract_number: string | null;
  setup_date: string | null;
  delivery_window: string | null;
  after_hours_window: string | null;
  discount_percent: number | null;
  subtotal_amount: number | null;
  delivery_fee: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  deposit_amount: number | null;
  balance_due: number | null;
  payment_method: string | null;
  internal_notes: string | null;
  created_at?: string;
  items?: AdminBookingItem[];
}

export interface AdminBookingItem {
  id?: number;
  booking_id?: number;
  quantity: number;
  unit_price: number;
  product_name: string;
  product_category?: string | null;
  total_price: number;
  notes?: string | null;
}

interface BookingsByDateResponse {
  date: string;
  bookings: AdminBooking[];
}

const API_BASE_URL = getApiUrl('bookings');

export const fetchBookingsByDate = async (date: string): Promise<AdminBooking[]> => {
  const response = await fetch(`${API_BASE_URL}/by-date/${encodeURIComponent(date)}`);

  if (!response.ok) {
    throw new Error('Failed to fetch bookings for the selected date.');
  }

  const data = (await response.json()) as BookingsByDateResponse;
  return data.bookings ?? [];
};

export const fetchDatesWithBookings = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/dates-with-bookings`);

  if (!response.ok) {
    throw new Error('Failed to fetch dates with bookings.');
  }

  const data = (await response.json()) as { dates: string[] };
  return data.dates ?? [];
};

export const downloadBookingPdf = async (bookingId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${bookingId}/pdf`);

  if (!response.ok) {
    throw new Error('Failed to download booking PDF.');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `booking-${bookingId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const fetchBookingById = async (bookingId: number): Promise<AdminBooking> => {
  const response = await fetch(`${API_BASE_URL}/${bookingId}`);

  if (!response.ok) {
    throw new Error('Failed to load booking details.');
  }

  return (await response.json()) as AdminBooking;
};

export interface UpdateBookingPayload {
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  event_date?: string | null;
  event_start_time?: string | null;
  event_end_time?: string | null;
  bounce_house_type?: string | null;
  organization_name?: string | null;
  event_address?: string | null;
  event_surface?: string | null;
  event_is_indoor?: boolean | number | null;
  invoice_number?: string | null;
  contract_number?: string | null;
  setup_date?: string | null;
  delivery_window?: string | null;
  after_hours_window?: string | null;
  discount_percent?: number | string | null;
  subtotal_amount?: number | string | null;
  delivery_fee?: number | string | null;
  tax_amount?: number | string | null;
  total_amount?: number | string | null;
  deposit_amount?: number | string | null;
  balance_due?: number | string | null;
  payment_method?: string | null;
  internal_notes?: string | null;
  items?: Array<{
    id?: number;
    product_name: string;
    quantity?: number | string;
    unit_price?: number | string;
    total_price?: number | string;
    product_category?: string | null;
    notes?: string | null;
  }>;
}

interface UpdateBookingResponse {
  success: boolean;
  message: string;
  booking: AdminBooking;
}

export const updateBooking = async (
  bookingId: number,
  payload: UpdateBookingPayload
): Promise<AdminBooking> => {
  const response = await fetch(`${API_BASE_URL}/${bookingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.message ?? 'Failed to update booking.';
    throw new Error(message);
  }

  const data = (await response.json()) as UpdateBookingResponse;
  return data.booking;
};

