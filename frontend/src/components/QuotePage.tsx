import React from 'react';
import './QuotePage.css';
import type { CartItem } from '../types/cart';

// QuotePage Component

interface QuotePageProps {
  cart: CartItem[];
  onBackToCategories: () => void;
  onClearCart: () => void;
}

const QuotePage: React.FC<QuotePageProps> = ({ cart, onBackToCategories, onClearCart }) => {
  // Get customer info from first item (assuming all items have same customer)
  const customerInfo = cart.length > 0 ? cart[0].bookingData : null;

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.inflatable.price, 0);
  const taxRate = 0.10; // 10% tax (Arkansas)
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return 'TBD';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (cart.length === 0) {
    return (
      <div className="quote-page">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Start by selecting a category and adding items to your cart.</p>
          <button onClick={onBackToCategories} className="btn btn-primary">
            Browse Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-page">
      <div className="quote-header">
        <h1>📋 Your Quote</h1>
        <p className="quote-subtitle">Review your booking selections below</p>
      </div>

      {customerInfo && (
        <div className="customer-info-section">
          <h2>Customer Information</h2>
          <div className="customer-details">
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{customerInfo.customer_name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{customerInfo.customer_email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{customerInfo.customer_phone}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bookings-section">
        <h2>Your Bookings ({cart.length})</h2>
        <div className="bookings-list">
          {cart.map((item, index) => (
            <div key={item.id} className="booking-item">
              <div className="booking-item-header">
                <div className="booking-number">Booking #{index + 1}</div>
                <div className="booking-date">
                  {formatDate(item.bookingData.event_date)}
                </div>
              </div>
              
              <div className="booking-item-content">
                <div className="inflatable-info">
                  <img 
                    src={item.inflatable.image} 
                    alt={item.inflatable.name}
                    className="inflatable-thumbnail"
                  />
                  <div className="inflatable-details">
                    <h3>{item.inflatable.name}</h3>
                    <p className="inflatable-description">{item.inflatable.description}</p>
                    <div className="inflatable-specs">
                      <span>Capacity: {item.inflatable.capacity}</span>
                      <span>Size: {item.inflatable.dimensions}</span>
                    </div>
                  </div>
                </div>
                
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="detail-label">Event Time:</span>
                    <span className="detail-value">
                      {formatTime(item.bookingData.event_start_time)} - {formatTime(item.bookingData.event_end_time)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value price">${item.inflatable.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="quote-summary">
        <h2>Quote Summary</h2>
        <div className="summary-details">
          <div className="summary-row">
            <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'}):</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (10%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="quote-actions">
        <button onClick={onBackToCategories} className="btn btn-secondary">
          Add More Items
        </button>
        <button onClick={onClearCart} className="btn btn-secondary">
          Clear Cart
        </button>
        <div className="quote-note">
          <p>📞 We'll contact you soon to confirm your booking and finalize the details.</p>
          <p>This is a quote - no payment is required at this time.</p>
        </div>
      </div>
    </div>
  );
};

export default QuotePage;

