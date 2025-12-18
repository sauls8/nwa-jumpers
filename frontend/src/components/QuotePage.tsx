import React, { useState } from 'react';
import './QuotePage.css';
import type { CartItem, CustomerInfo, QuoteInfo, EventInfo } from '../types/cart';
import { submitQuote, downloadQuotePDF } from '../services/bookingService';

interface QuotePageProps {
  cart: CartItem[];
  customerInfo: CustomerInfo | null;
  eventInfo: EventInfo | null; // Shared event date/time for all items
  quoteInfo: QuoteInfo | null; // Quote info from order form (surface, notes, etc.)
  onRemoveFromCart: (itemId: string) => void;
  onBackToCategories: () => void;
  onClearCart: () => void;
}

const QuotePage: React.FC<QuotePageProps> = ({ cart, customerInfo, eventInfo, quoteInfo: propQuoteInfo, onRemoveFromCart, onBackToCategories, onClearCart }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Use quote info from props (pre-filled from order form)
  const quoteInfo = propQuoteInfo || {
    organization_name: '',
    event_address: '',
    event_surface: '',
    event_is_indoor: false
  };

  // Use shared event info (all items use the same date/time)
  const eventDate = eventInfo?.event_date || '';
  const eventStartTime = eventInfo?.event_start_time || '';
  const eventEndTime = eventInfo?.event_end_time || '';

  // Calculate totals with discounts and fees
  const baseSubtotal = cart.reduce((sum, item) => sum + (item.inflatable.price || 0), 0);
  
  // Calculate discounts
  let discountPercent = 0;
  let discountAmount = 0;
  
  if (cart.length > 1) {
    // 10% off for multiple inflatable rentals
    discountPercent = 10;
  } else if (baseSubtotal >= 2000) {
    // 20% off for $2,000+
    discountPercent = 20;
  } else if (baseSubtotal >= 1200) {
    // 15% off for $1,200+
    discountPercent = 15;
  }
  
  discountAmount = baseSubtotal * (discountPercent / 100);
  const subtotalAfterDiscount = baseSubtotal - discountAmount;
  
  // Calculate additional fees
  let surfaceFee = 0;
  if (quoteInfo.event_surface && 
      ['Concrete', 'Asphalt', 'Indoor', 'Parking Lot'].includes(quoteInfo.event_surface)) {
    surfaceFee = 30;
  }
  
  const overnightFee = quoteInfo.overnight_pickup ? 75 : 0;
  
  // Final subtotal (after discounts, before tax)
  const subtotal = subtotalAfterDiscount + surfaceFee + overnightFee;
  
  // Calculate tax (10% on final subtotal)
  const taxRate = 0.10; // 10% tax (Arkansas)
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return 'TBD';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleGenerateQuote = async () => {
    if (cart.length === 0) {
      setSubmitStatus({
        type: 'error',
        message: 'Your cart is empty. Please add items before generating a quote.',
      });
      return;
    }

    if (!customerInfo) {
      setSubmitStatus({
        type: 'error',
        message: 'Customer information is missing. Please go back and fill out your information.',
      });
      return;
    }

    if (!eventInfo || !eventDate || !eventStartTime || !eventEndTime) {
      setSubmitStatus({
        type: 'error',
        message: 'Event date and time are required. Please go back and set your event details.',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Calculate totals with discounts and fees (same as display)
      const baseSubtotal = cart.reduce((sum, item) => sum + (item.inflatable.price || 0), 0);
      let discountPercent = 0;
      if (cart.length > 1) {
        discountPercent = 10;
      } else if (baseSubtotal >= 2000) {
        discountPercent = 20;
      } else if (baseSubtotal >= 1200) {
        discountPercent = 15;
      }
      const discountAmount = baseSubtotal * (discountPercent / 100);
      const subtotalAfterDiscount = baseSubtotal - discountAmount;
      
      let surfaceFee = 0;
      if (quoteInfo.event_surface && 
          ['Concrete', 'Asphalt', 'Indoor', 'Parking Lot'].includes(quoteInfo.event_surface)) {
        surfaceFee = 30;
      }
      const overnightFee = quoteInfo.overnight_pickup ? 75 : 0;
      const finalSubtotal = subtotalAfterDiscount + surfaceFee + overnightFee;
      const calculatedTax = finalSubtotal * 0.10;
      const calculatedTotal = finalSubtotal + calculatedTax;

      const result = await submitQuote(
        customerInfo,
        cart,
        {
          ...quoteInfo,
          discount_percent: discountPercent > 0 ? discountPercent : undefined
        },
        eventDate,
        eventStartTime,
        eventEndTime,
        finalSubtotal,
        calculatedTax,
        calculatedTotal
      );

      if (result.success && result.booking_id) {
        setSubmitStatus({
          type: 'success',
          message: `Quote generated successfully! Downloading PDF...`,
        });

        // Download PDF
        try {
          await downloadQuotePDF(result.booking_id);
          setSubmitStatus({
            type: 'success',
            message: `Quote generated and downloaded! We'll contact you soon to confirm.`,
          });
        } catch (pdfError) {
          console.error('Error downloading PDF:', pdfError);
          setSubmitStatus({
            type: 'success',
            message: `Quote generated successfully! PDF download failed, but we'll contact you soon.`,
          });
        }

        // Clear cart and redirect after 3 seconds
        setTimeout(() => {
          onClearCart();
          onBackToCategories();
        }, 3000);
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'Failed to generate quote. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error generating quote:', error);
      setSubmitStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again or contact us.',
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <p className="quote-subtitle">Review your booking selections and generate your quote</p>
      </div>

      {/* Customer Information */}
      {customerInfo && (
        <div className="customer-info-section">
          <h2>Customer Information</h2>
          <div className="customer-details">
            {customerInfo.company_name && (
              <div className="detail-row">
                <span className="detail-label">Company:</span>
                <span className="detail-value">{customerInfo.company_name}</span>
              </div>
            )}
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
            {customerInfo.street_address && (
              <>
                <div className="detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{customerInfo.street_address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">City, State, ZIP:</span>
                  <span className="detail-value">
                    {customerInfo.city}{customerInfo.city && customerInfo.state ? ', ' : ''}
                    {customerInfo.state} {customerInfo.postal_code}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Event Information */}
      <div className="event-info-section">
        <h2>Event Information</h2>
        <div className="event-details">
          <div className="detail-row">
            <span className="detail-label">Event Date:</span>
            <span className="detail-value">{formatDate(eventDate)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Event Time:</span>
            <span className="detail-value">
              {formatTime(eventStartTime)} - {formatTime(eventEndTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Quote Information - Display only (from order form) */}
      {(quoteInfo.organization_name || quoteInfo.event_address || quoteInfo.event_surface || quoteInfo.notes || quoteInfo.overnight_pickup) && (
        <div className="quote-info-section">
          <h2>Additional Information</h2>
          <div className="quote-info-display">
            {quoteInfo.organization_name && (
              <div className="detail-row">
                <span className="detail-label">Organization:</span>
                <span className="detail-value">{quoteInfo.organization_name}</span>
              </div>
            )}
            {quoteInfo.event_address && (
              <div className="detail-row">
                <span className="detail-label">Event Address:</span>
                <span className="detail-value">{quoteInfo.event_address}</span>
              </div>
            )}
            {quoteInfo.event_surface && (
              <div className="detail-row">
                <span className="detail-label">Surface Type:</span>
                <span className="detail-value">{quoteInfo.event_surface}</span>
              </div>
            )}
            {quoteInfo.overnight_pickup && (
              <div className="detail-row">
                <span className="detail-label">Overnight Pickup:</span>
                <span className="detail-value">Yes (+$75.00)</span>
              </div>
            )}
            {quoteInfo.notes && (
              <div className="detail-row">
                <span className="detail-label">Notes:</span>
                <span className="detail-value">{quoteInfo.notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="bookings-section">
        <h2>Your Items ({cart.length})</h2>
        <div className="bookings-list">
          {cart.map((item, index) => (
            <div key={item.id} className="booking-item">
              <div className="booking-item-header">
                <div className="booking-number">Item #{index + 1}</div>
                <button 
                  className="remove-item-btn"
                  onClick={() => onRemoveFromCart(item.id)}
                  title="Remove item"
                >
                  ×
                </button>
              </div>
              
              <div className="booking-item-content">
                <div className="inflatable-info">
                  <img 
                    src={item.inflatable.image || ''} 
                    alt={item.inflatable.name || 'Inflatable'}
                    className="inflatable-thumbnail"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120x120?text=Image';
                    }}
                  />
                  <div className="inflatable-details">
                    <h3>{item.inflatable.name || 'Unnamed Inflatable'}</h3>
                    <p className="inflatable-description">
                      {item.inflatable.description || 'No description available'}
                    </p>
                    <div className="inflatable-specs">
                      <span>Capacity: {item.inflatable.capacity || 'N/A'}</span>
                      <span>Size: {item.inflatable.dimensions || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value price">
                      ${(item.inflatable.price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote Summary */}
      <div className="quote-summary">
        <h2>Quote Summary</h2>
        <div className="summary-details">
          <div className="summary-row">
            <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'}):</span>
            <span>${baseSubtotal.toFixed(2)}</span>
          </div>
          {discountPercent > 0 && (
            <div className="summary-row discount">
              <span>Discount ({discountPercent}%):</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          {surfaceFee > 0 && (
            <div className="summary-row">
              <span>Surface Fee ({quoteInfo.event_surface}):</span>
              <span>${surfaceFee.toFixed(2)}</span>
            </div>
          )}
          {overnightFee > 0 && (
            <div className="summary-row">
              <span>Overnight Pickup:</span>
              <span>${overnightFee.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Subtotal After Discounts/Fees:</span>
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

      {/* Status Message */}
      {submitStatus.type && (
        <div className={`submit-status ${submitStatus.type}`}>
          <p>{submitStatus.message}</p>
        </div>
      )}

      {/* Actions */}
      <div className="quote-actions">
        <button 
          onClick={handleGenerateQuote} 
          className="btn btn-primary"
          disabled={isSubmitting || cart.length === 0 || !customerInfo}
        >
          {isSubmitting ? 'Generating Quote...' : 'Generate Quote'}
        </button>
        <button 
          onClick={onBackToCategories} 
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Add More Items
        </button>
        <button 
          onClick={onClearCart} 
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Clear Cart
        </button>
        {!submitStatus.type && (
          <div className="quote-note">
            <p>📞 Review your items and additional information above, then click "Generate Quote" to create your quote PDF.</p>
            <p>We'll contact you soon to finalize the details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotePage;
