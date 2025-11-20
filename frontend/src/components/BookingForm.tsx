import React, { useState, useEffect } from 'react';
import './BookingForm.css';
import type { Inflatable } from '../data/inflatables';
import type { CartItem, CustomerInfo, EventInfo } from '../types/cart';
import Calendar from './Calendar';
import { checkDateAvailability } from '../services/availabilityService';

interface BookingFormProps {
  selectedCategory?: string;
  selectedInflatable?: Inflatable | null;
  customerInfo: CustomerInfo | null;
  eventInfo: EventInfo | null; // Shared event date/time (locked if cart has items)
  onSetCustomerInfo: (info: CustomerInfo) => void;
  onAddToCart: (cartItem: CartItem, eventInfo: EventInfo) => void;
  onProceedToCheckout: () => void;
  onBackToCategories: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  selectedCategory, 
  selectedInflatable,
  customerInfo,
  eventInfo,
  onSetCustomerInfo,
  onAddToCart,
  onProceedToCheckout,
  onBackToCategories
}) => {
  // Customer info (only collect if not already set)
  const [customerForm, setCustomerForm] = useState<CustomerInfo>({
    customer_name: customerInfo?.customer_name || '',
    customer_email: customerInfo?.customer_email || '',
    customer_phone: customerInfo?.customer_phone || ''
  });

  // Event date/time - use locked eventInfo if available, otherwise allow editing
  const isEventLocked = !!eventInfo; // If eventInfo exists, date/time is locked
  const [eventData, setEventData] = useState<EventInfo>({
    event_date: eventInfo?.event_date || '',
    event_start_time: eventInfo?.event_start_time || '',
    event_end_time: eventInfo?.event_end_time || ''
  });

  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showAddMorePrompt, setShowAddMorePrompt] = useState(false);

  // Update customer form when customerInfo changes (with Chrome-safe handling)
  useEffect(() => {
    if (customerInfo && (
      customerInfo.customer_name !== customerForm.customer_name ||
      customerInfo.customer_email !== customerForm.customer_email ||
      customerInfo.customer_phone !== customerForm.customer_phone
    )) {
      setCustomerForm(customerInfo);
    }
  }, [customerInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update event data when eventInfo changes (if locked)
  useEffect(() => {
    if (eventInfo && eventInfo.event_date && eventInfo.event_start_time && eventInfo.event_end_time) {
      setEventData(eventInfo);
    }
  }, [eventInfo]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'customer_name':
        return value.trim() ? '' : 'Name is required';
      case 'customer_email':
        if (!value.trim()) return 'Email is required';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address';
      case 'customer_phone':
        return value.trim() ? '' : 'Phone number is required';
      case 'event_date':
        return value ? '' : 'Event date is required';
      case 'event_start_time':
        return value ? '' : 'Event start time is required';
      case 'event_end_time':
        return value ? '' : 'Event end time is required';
      default:
        return '';
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'customer_phone') {
      processedValue = formatPhoneNumber(value);
    }
    
    setCustomerForm(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    const fieldError = validateField(name, processedValue);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleEventInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
    
    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleDateSelect = (date: string) => {
    if (!date || typeof date !== 'string') {
      return;
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      setFieldErrors(prev => ({
        ...prev,
        event_date: 'Invalid date selected'
      }));
      return;
    }

    setEventData(prev => ({
      ...prev,
      event_date: date
    }));
    
    const fieldError = validateField('event_date', date);
    setFieldErrors(prev => ({
      ...prev,
      event_date: fieldError
    }));
  };

  const validateForm = (): boolean => {
    // Validate customer info if not already set
    if (!customerInfo) {
      if (!customerForm.customer_name.trim()) {
        setError('Name is required');
        return false;
      }
      if (!customerForm.customer_email.trim()) {
        setError('Email is required');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.customer_email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!customerForm.customer_phone.trim()) {
        setError('Phone number is required');
        return false;
      }
    }

    // Validate event data
    if (!eventData.event_date) {
      setError('Event date is required');
      return false;
    }
    if (!eventData.event_start_time) {
      setError('Event start time is required');
      return false;
    }
    if (!eventData.event_end_time) {
      setError('Event end time is required');
      return false;
    }

    if (!selectedInflatable) {
      setError('Please select an inflatable');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!validateForm()) {
        return;
      }

      if (!selectedInflatable || !selectedInflatable.id || !selectedInflatable.name) {
        setError('Invalid inflatable selected. Please try again.');
        return;
      }

      // Save customer info if not already set
      if (!customerInfo) {
        onSetCustomerInfo(customerForm);
      }

      // Add item to cart with event info
      const cartItem: CartItem = {
        id: `${selectedInflatable.id}-${Date.now()}`,
        inflatable: selectedInflatable
      };

      const newEventInfo: EventInfo = {
        event_date: eventData.event_date,
        event_start_time: eventData.event_start_time,
        event_end_time: eventData.event_end_time
      };

      onAddToCart(cartItem, newEventInfo);
      
      // Show prompt asking if they want to add more items for the same event
      setShowAddMorePrompt(true);
      
      // Clear field errors
      setFieldErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleAddMoreItems = () => {
    setShowAddMorePrompt(false);
    // Keep the same date/time locked, go back to categories to pick another inflatable
    onBackToCategories();
  };

  const handleGoToQuote = () => {
    setShowAddMorePrompt(false);
    onProceedToCheckout();
  };

  // Calculate running total
  const basePrice = selectedInflatable?.price && typeof selectedInflatable.price === 'number' 
    ? selectedInflatable.price 
    : 0;
  const taxRate = 0.10;
  const tax = basePrice * taxRate;
  const total = basePrice + tax;

  // Show prompt after adding item to cart
  if (showAddMorePrompt) {
    return (
      <div className="booking-form-container">
        <div className="add-more-prompt">
          <div className="prompt-content">
            <h3>✓ Item Added to Cart!</h3>
            <p>Would you like to add more inflatables for this same event?</p>
            <div className="prompt-event-info">
              <p><strong>Event Date:</strong> {eventData.event_date ? new Date(eventData.event_date).toLocaleDateString() : ''}</p>
              <p><strong>Event Time:</strong> {eventData.event_start_time} - {eventData.event_end_time}</p>
            </div>
            <div className="prompt-actions">
              <button 
                onClick={handleAddMoreItems}
                className="btn btn-primary"
              >
                Add More Items
              </button>
              <button 
                onClick={handleGoToQuote}
                className="btn btn-secondary"
              >
                Generate Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      {/* Show locked event info banner if event is locked */}
      {isEventLocked && eventInfo && (
        <div className="locked-event-banner">
          <p>📅 <strong>Event Date/Time Locked:</strong> {(() => {
            try {
              return new Date(eventInfo.event_date).toLocaleDateString();
            } catch {
              return eventInfo.event_date;
            }
          })()} from {eventInfo.event_start_time} to {eventInfo.event_end_time}</p>
          <p className="banner-note">All items in your cart will use this same event date and time.</p>
        </div>
      )}
      
      <div className="booking-header">
        <h2>Book Your Bounce House</h2>
        {selectedInflatable && (
          <div className="price-summary-sticky">
            <div className="price-summary-content">
              <div className="price-line">
                <span>Base Price:</span>
                <span>${basePrice.toFixed(2)}</span>
              </div>
              <div className="price-line">
                <span>Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="price-line total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedCategory && (
        <div className="selected-category">
          <p>Selected Category: <strong>{selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</strong></p>
        </div>
      )}
      
      {selectedInflatable && selectedInflatable.id && (
        <div className="selected-inflatable">
          <div className="inflatable-info">
            <div className="inflatable-image">
              <img 
                src={selectedInflatable.image || ''} 
                alt={selectedInflatable.name || 'Selected inflatable'} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120x120?text=Image';
                }}
              />
            </div>
            <div className="inflatable-details">
              <h3>{selectedInflatable.name || 'Unnamed Inflatable'}</h3>
              <p className="inflatable-price">
                ${selectedInflatable.price && typeof selectedInflatable.price === 'number' 
                  ? selectedInflatable.price.toFixed(2) 
                  : '0.00'}
              </p>
              <p className="inflatable-description">
                {selectedInflatable.description || 'No description available'}
              </p>
              <div className="inflatable-specs">
                <span><strong>Capacity:</strong> {selectedInflatable.capacity || 'N/A'}</span>
                <span><strong>Size:</strong> {selectedInflatable.dimensions || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-form">
        {error && <div className="error-message">{error}</div>}
        
        {/* Customer Info Section - Only show if not already set */}
        {!customerInfo && (
          <>
            <h3 className="form-section-title">Your Information</h3>
            <div className="form-group">
              <label htmlFor="customer_name">Full Name *</label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={customerForm.customer_name}
                onChange={handleCustomerInputChange}
                required
                className={fieldErrors.customer_name ? 'error' : ''}
              />
              {fieldErrors.customer_name && (
                <span className="field-error">{fieldErrors.customer_name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="customer_email">Email Address *</label>
              <input
                type="email"
                id="customer_email"
                name="customer_email"
                value={customerForm.customer_email}
                onChange={handleCustomerInputChange}
                required
                className={fieldErrors.customer_email ? 'error' : ''}
              />
              {fieldErrors.customer_email && (
                <span className="field-error">{fieldErrors.customer_email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="customer_phone">Phone Number *</label>
              <input
                type="tel"
                id="customer_phone"
                name="customer_phone"
                value={customerForm.customer_phone}
                onChange={handleCustomerInputChange}
                required
                className={fieldErrors.customer_phone ? 'error' : ''}
              />
              {fieldErrors.customer_phone && (
                <span className="field-error">{fieldErrors.customer_phone}</span>
              )}
            </div>
          </>
        )}

        {/* Event Details Section */}
        <h3 className="form-section-title">Event Details</h3>
        <div className="form-group">
          <label htmlFor="event_date">Event Date *</label>
          {isEventLocked ? (
            <div className="locked-field">
              <input
                type="text"
                id="event_date"
                value={eventData.event_date ? (() => {
                  try {
                    const date = new Date(eventData.event_date);
                    return isNaN(date.getTime()) ? eventData.event_date : date.toLocaleDateString();
                  } catch {
                    return eventData.event_date;
                  }
                })() : ''}
                readOnly
                className="date-input locked"
                disabled
              />
              <span className="locked-badge">Locked</span>
            </div>
          ) : (
            <>
              <input
                type="text"
                id="event_date"
                name="event_date"
                value={eventData.event_date ? (() => {
                  try {
                    const date = new Date(eventData.event_date);
                    return isNaN(date.getTime()) ? eventData.event_date : date.toLocaleDateString();
                  } catch {
                    return eventData.event_date;
                  }
                })() : ''}
                readOnly
                placeholder="Select date below"
                className={`date-input ${fieldErrors.event_date ? 'error' : ''}`}
                required
              />
              {fieldErrors.event_date && (
                <span className="field-error">{fieldErrors.event_date}</span>
              )}
              <div className="calendar-inline">
                <Calendar
                  selectedDate={eventData.event_date}
                  onDateSelect={handleDateSelect}
                  onAvailabilityCheck={(date: string) => checkDateAvailability(date, selectedInflatable?.name)}
                />
              </div>
            </>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="event_start_time">Event Start Time *</label>
          {isEventLocked ? (
            <div className="locked-field">
              <input
                type="time"
                id="event_start_time"
                value={eventData.event_start_time}
                readOnly
                disabled
                className="time-input locked"
              />
              <span className="locked-badge">Locked</span>
            </div>
          ) : (
            <>
              <div className="time-slot-buttons">
                <button
                  type="button"
                  className={`time-slot-btn ${eventData.event_start_time >= '08:00' && eventData.event_start_time < '12:00' ? 'active' : ''}`}
                  onClick={() => {
                    setEventData(prev => ({ ...prev, event_start_time: '08:00', event_end_time: '12:00' }));
                    setFieldErrors(prev => ({ ...prev, event_start_time: '', event_end_time: '' }));
                  }}
                >
                  Morning (8 AM - 12 PM)
                </button>
                <button
                  type="button"
                  className={`time-slot-btn ${eventData.event_start_time >= '12:00' && eventData.event_start_time < '17:00' ? 'active' : ''}`}
                  onClick={() => {
                    setEventData(prev => ({ ...prev, event_start_time: '12:00', event_end_time: '17:00' }));
                    setFieldErrors(prev => ({ ...prev, event_start_time: '', event_end_time: '' }));
                  }}
                >
                  Afternoon (12 PM - 5 PM)
                </button>
                <button
                  type="button"
                  className={`time-slot-btn ${eventData.event_start_time >= '17:00' && eventData.event_start_time < '21:00' ? 'active' : ''}`}
                  onClick={() => {
                    setEventData(prev => ({ ...prev, event_start_time: '17:00', event_end_time: '21:00' }));
                    setFieldErrors(prev => ({ ...prev, event_start_time: '', event_end_time: '' }));
                  }}
                >
                  Evening (5 PM - 9 PM)
                </button>
              </div>
              <input
                type="time"
                id="event_start_time"
                name="event_start_time"
                value={eventData.event_start_time}
                onChange={handleEventInputChange}
                required
                className={`time-input ${fieldErrors.event_start_time ? 'error' : ''}`}
                placeholder="Or select custom time"
              />
              {fieldErrors.event_start_time && (
                <span className="field-error">{fieldErrors.event_start_time}</span>
              )}
            </>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="event_end_time">Event End Time *</label>
          {isEventLocked ? (
            <div className="locked-field">
              <input
                type="time"
                id="event_end_time"
                value={eventData.event_end_time}
                readOnly
                disabled
                className="time-input locked"
              />
              <span className="locked-badge">Locked</span>
            </div>
          ) : (
            <>
              <input
                type="time"
                id="event_end_time"
                name="event_end_time"
                value={eventData.event_end_time}
                onChange={handleEventInputChange}
                required
                className={`time-input ${fieldErrors.event_end_time ? 'error' : ''}`}
              />
              {fieldErrors.event_end_time && (
                <span className="field-error">{fieldErrors.event_end_time}</span>
              )}
            </>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
        >
          Add to Cart
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
