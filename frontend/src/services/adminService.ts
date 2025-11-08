export interface AdminBooking {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string;
  event_start_time: string | null;
  event_end_time: string | null;
  bounce_house_type: string;
  created_at?: string;
}

interface BookingsByDateResponse {
  date: string;
  bookings: AdminBooking[];
}

const API_BASE_URL = 'http://localhost:3001/api/bookings';

export const fetchBookingsByDate = async (date: string): Promise<AdminBooking[]> => {
  const response = await fetch(`${API_BASE_URL}/by-date/${encodeURIComponent(date)}`);

  if (!response.ok) {
    throw new Error('Failed to fetch bookings for the selected date.');
  }

  const data = (await response.json()) as BookingsByDateResponse;
  return data.bookings ?? [];
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

