import { useEffect, useMemo, useState } from 'react';
import './AdminBookingsPage.css';
import type { AdminBooking } from '../services/adminService';
import { downloadBookingPdf, fetchBookingsByDate } from '../services/adminService';
import AdminBookingEditor from './AdminBookingEditor';

interface AdminBookingsPageProps {
  onBack: () => void;
}

const formatDisplayDate = (date: string): string => {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTimeRange = (start: string | null, end: string | null): string => {
  if (start && end) {
    return `${start} – ${end}`;
  }
  if (start) {
    return `${start} – TBD`;
  }
  if (end) {
    return `TBD – ${end}`;
  }
  return 'Time TBD';
};

const formatSubmittedAt = (timestamp?: string): string => {
  if (!timestamp) {
    return 'N/A';
  }
  const normalized = timestamp.replace(' ', 'T');
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return timestamp;
  }
  return parsed.toLocaleString();
};

const AdminBookingsPage: React.FC<AdminBookingsPageProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [editorBookingId, setEditorBookingId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  const friendlyDate = useMemo(
    () => formatDisplayDate(selectedDate),
    [selectedDate]
  );

  useEffect(() => {
    const loadBookings = async () => {
      if (!selectedDate) {
        setBookings([]);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const results = await fetchBookingsByDate(selectedDate);
        setBookings(results);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong while loading bookings.'
        );
      } finally {
        setHasFetched(true);
        setIsLoading(false);
      }
    };

    void loadBookings();
  }, [selectedDate]);

  const handleDownloadPdf = async (bookingId: number) => {
    try {
      await downloadBookingPdf(bookingId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to download booking summary.'
      );
    }
  };

  const handleOpenEditor = (bookingId: number) => {
    setEditorBookingId(bookingId);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditorBookingId(null);
  };

  const handleBookingUpdated = (updatedBooking: AdminBooking) => {
    setBookings((prev) =>
      prev.map((booking) => (booking.id === updatedBooking.id ? updatedBooking : booking))
    );
  };

  return (
    <div className="admin-bookings-container">
      <div className="admin-page-header">
        <div>
          <h2>Admin Booking Dashboard</h2>
          <p>Review scheduled rentals by date and export printable summaries.</p>
        </div>
        <button className="back-button" onClick={onBack}>
          ← Back to Customer View
        </button>
      </div>

      <section className="admin-controls">
        <div className="control-group">
          <label htmlFor="admin-date-picker">Select Date</label>
          <input
            id="admin-date-picker"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            max="9999-12-31"
          />
        </div>
        <div className="control-group summary">
          <span className="control-label">Bookings Found</span>
          <span className="control-value">{bookings.length}</span>
        </div>
      </section>

      {isLoading && (
        <div className="admin-status">Loading bookings for {friendlyDate}...</div>
      )}

      {error && !isLoading && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {!isLoading && !error && hasFetched && bookings.length === 0 && (
        <div className="admin-empty-state">
          <h3>No bookings scheduled</h3>
          <p>{friendlyDate}</p>
          <p className="admin-empty-hint">
            Once a customer reserves an inflatable for this date, it will appear here automatically.
          </p>
        </div>
      )}

      {!isLoading && bookings.length > 0 && (
        <div className="admin-bookings-grid">
          {bookings.map((booking) => (
            <article className="admin-booking-card" key={booking.id}>
              <header className="booking-card-header">
                <div>
                  <h3>{booking.customer_name}</h3>
                  <p className="booking-time">
                    {formatTimeRange(booking.event_start_time, booking.event_end_time)}
                  </p>
                </div>
                <span className="booking-id">#{booking.id}</span>
              </header>

              <div className="booking-card-body">
                <div className="booking-field">
                  <span className="label">Date</span>
                  <span>{formatDisplayDate(booking.event_date)}</span>
                </div>
                <div className="booking-field">
                  <span className="label">Bounce House</span>
                  <span>{booking.bounce_house_type || '—'}</span>
                </div>
                <div className="booking-field">
                  <span className="label">Email</span>
                  <span>{booking.customer_email}</span>
                </div>
                <div className="booking-field">
                  <span className="label">Phone</span>
                  <span>{booking.customer_phone}</span>
                </div>
                <div className="booking-field">
                  <span className="label">Delivery Window</span>
                  <span>{booking.delivery_window || '—'}</span>
                </div>
                <div className="booking-field">
                  <span className="label">Balance Due</span>
                  <span>
                    {booking.balance_due !== null && booking.balance_due !== undefined
                      ? `$${Number(booking.balance_due).toFixed(2)}`
                      : '—'}
                  </span>
                </div>
                <div className="booking-field">
                  <span className="label">Submitted</span>
                  <span>{formatSubmittedAt(booking.created_at)}</span>
                </div>
              </div>

              <footer className="booking-card-footer">
                <button
                  className="admin-edit-button"
                  onClick={() => handleOpenEditor(booking.id)}
                >
                  ✏️ Edit Details
                </button>
                <button
                  className="admin-pdf-button"
                  onClick={() => handleDownloadPdf(booking.id)}
                >
                  ⬇ Download PDF
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
      <AdminBookingEditor
        bookingId={editorBookingId}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onBookingUpdated={handleBookingUpdated}
      />
    </div>
  );
};

export default AdminBookingsPage;

