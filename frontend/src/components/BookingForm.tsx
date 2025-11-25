import React, { useState, useEffect } from 'react';
import './BookingForm.css';
import type { Inflatable } from '../data/inflatables';
import { inflatablesData } from '../data/inflatables';
import type { CartItem, CustomerInfo, EventInfo, QuoteInfo } from '../types/cart';
import Calendar from './Calendar';
import { checkDateAvailability } from '../services/availabilityService';

interface BookingFormProps {
  selectedCategory?: string;
  selectedInflatable?: Inflatable | null;
  customerInfo: CustomerInfo | null;
  eventInfo: EventInfo | null; // Shared event date/time (locked if cart has items)
  onSetCustomerInfo: (info: CustomerInfo) => void;
  onAddToCart: (cartItem: CartItem, eventInfo: EventInfo) => void;
  onSetQuoteInfo: (info: QuoteInfo) => void; // Pass quote info (surface, notes, overnight)
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
  onSetQuoteInfo,
  onProceedToCheckout,
  onBackToCategories
}) => {
  // Extended customer info for order form
  const [customerForm, setCustomerForm] = useState<CustomerInfo>({
    customer_name: customerInfo?.customer_name || '',
    customer_email: customerInfo?.customer_email || '',
    customer_phone: customerInfo?.customer_phone || '',
    company_name: customerInfo?.company_name || '',
    first_name: customerInfo?.first_name || '',
    last_name: customerInfo?.last_name || '',
    street_address: customerInfo?.street_address || '',
    city: customerInfo?.city || '',
    state: customerInfo?.state || '',
    postal_code: customerInfo?.postal_code || ''
  });

  // Order form specific fields
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [overnightPickup, setOvernightPickup] = useState(false);
  const [surfaceType, setSurfaceType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

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

  // Initialize selected items if coming from single inflatable selection
  useEffect(() => {
    if (selectedInflatable && selectedInflatable.id) {
      setSelectedItems(new Set([selectedInflatable.id]));
    }
  }, [selectedInflatable]);

  // Handle item checkbox toggle
  const handleItemToggle = (inflatableId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(inflatableId)) {
        newSet.delete(inflatableId);
      } else {
        newSet.add(inflatableId);
      }
      return newSet;
    });
  };

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
      case 'first_name':
        return value.trim() ? '' : 'First name is required';
      case 'last_name':
        return value.trim() ? '' : 'Last name is required';
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
      case 'street_address':
        return value.trim() ? '' : 'Street address is required';
      case 'city':
        return value.trim() ? '' : 'City is required';
      case 'state':
        return value.trim() ? '' : 'State is required';
      case 'postal_code':
        return value.trim() ? '' : 'Postal code is required';
      default:
        return '';
    }
  };

  // Format phone number as user types (### ### #### format)
  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
    }
    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 10)}`;
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
      // Use first_name/last_name if available, otherwise use customer_name
      const firstName = customerForm.first_name || customerForm.customer_name.split(' ')[0] || '';
      const lastName = customerForm.last_name || customerForm.customer_name.split(' ').slice(1).join(' ') || '';
      
      if (!firstName.trim()) {
        setError('First name is required');
        return false;
      }
      if (!lastName.trim()) {
        setError('Last name is required');
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
      if (!customerForm.street_address?.trim()) {
        setError('Street address is required');
        return false;
      }
      if (!customerForm.city?.trim()) {
        setError('City is required');
        return false;
      }
      if (!customerForm.state?.trim()) {
        setError('State is required');
        return false;
      }
      if (!customerForm.postal_code?.trim()) {
        setError('Postal code is required');
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

    // Validate at least one item is selected
    if (selectedItems.size === 0) {
      setError('Please select at least one inflatable');
      return false;
    }

    // Validate surface type if required
    if (!surfaceType) {
      setError('Please select a surface type');
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

      // Save customer info if not already set
      if (!customerInfo) {
        // Combine first_name and last_name into customer_name if needed
        const fullName = customerForm.first_name && customerForm.last_name
          ? `${customerForm.first_name} ${customerForm.last_name}`
          : customerForm.customer_name;
        
        const customerInfoToSave: CustomerInfo = {
          ...customerForm,
          customer_name: fullName
        };
        onSetCustomerInfo(customerInfoToSave);
      }

      // Add all selected items to cart
      const newEventInfo: EventInfo = {
        event_date: eventData.event_date,
        event_start_time: eventData.event_start_time,
        event_end_time: eventData.event_end_time
      };

      // Save quote info (surface, notes, overnight, company, address)
      const quoteInfoToSave: QuoteInfo = {
        organization_name: customerForm.company_name || undefined,
        event_address: customerForm.street_address && customerForm.city && customerForm.state && customerForm.postal_code
          ? `${customerForm.street_address}, ${customerForm.city}, ${customerForm.state} ${customerForm.postal_code}`
          : undefined,
        event_surface: surfaceType || undefined,
        event_is_indoor: surfaceType === 'Indoor',
        overnight_pickup: overnightPickup || undefined,
        notes: notes || undefined
      };
      onSetQuoteInfo(quoteInfoToSave);

      // Add each selected item to cart
      selectedItems.forEach((inflatableId) => {
        const inflatable = inflatablesData.find(i => i.id === inflatableId);
        if (inflatable) {
          const cartItem: CartItem = {
            id: `${inflatable.id}-${Date.now()}-${Math.random()}`,
            inflatable: inflatable
          };
          onAddToCart(cartItem, newEventInfo);
        }
      });
      
      // Show success message and option to proceed
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
    // Clear the form but keep event date/time locked
    // Go back to categories to pick more items
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

  // Show prompt after adding items to cart
  if (showAddMorePrompt) {
    return (
      <div className="booking-form-container">
        <div className="add-more-prompt">
          <div className="prompt-content">
            <h3>✓ Items Added to Cart!</h3>
            <p>{selectedItems.size} {selectedItems.size === 1 ? 'item has' : 'items have'} been added to your cart.</p>
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
                View Cart & Generate Quote
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
        <h2>Order Form</h2>
      </div>

      <form onSubmit={handleSubmit} className="order-form">
        {error && <div className="error-message">{error}</div>}
        
        {/* Customer Information Section */}
        <div className="form-row">
          <label htmlFor="company_name">Company Name</label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={customerForm.company_name || ''}
            onChange={handleCustomerInputChange}
          />
        </div>

        <div className="form-row">
          <label htmlFor="first_name">Contact Name*</label>
          <div className="name-inputs">
            <input
              type="text"
              id="first_name"
              name="first_name"
              placeholder="First"
              value={customerForm.first_name || ''}
              onChange={handleCustomerInputChange}
              className={fieldErrors.first_name ? 'error' : ''}
            />
            <input
              type="text"
              id="last_name"
              name="last_name"
              placeholder="Last"
              value={customerForm.last_name || ''}
              onChange={handleCustomerInputChange}
              className={fieldErrors.last_name ? 'error' : ''}
            />
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="customer_phone">Phone*</label>
          <input
            type="tel"
            id="customer_phone"
            name="customer_phone"
            placeholder="### ### ####"
            value={customerForm.customer_phone}
            onChange={handleCustomerInputChange}
            required
            className={fieldErrors.customer_phone ? 'error' : ''}
          />
        </div>

        <div className="form-row">
          <label htmlFor="customer_email">Email*</label>
          <input
            type="email"
            id="customer_email"
            name="customer_email"
            value={customerForm.customer_email}
            onChange={handleCustomerInputChange}
            required
            className={fieldErrors.customer_email ? 'error' : ''}
          />
        </div>

        <div className="form-row">
          <label>Delivery Address*</label>
          <div className="address-inputs">
            <input
              type="text"
              name="street_address"
              placeholder="Street Address"
              value={customerForm.street_address || ''}
              onChange={handleCustomerInputChange}
              className={fieldErrors.street_address ? 'error' : ''}
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={customerForm.city || ''}
              onChange={handleCustomerInputChange}
              className={fieldErrors.city ? 'error' : ''}
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={customerForm.state || ''}
              onChange={handleCustomerInputChange}
              className={fieldErrors.state ? 'error' : ''}
            />
            <input
              type="text"
              name="postal_code"
              placeholder="Postal / Zip Code"
              value={customerForm.postal_code || ''}
              onChange={handleCustomerInputChange}
              className={fieldErrors.postal_code ? 'error' : ''}
            />
          </div>
        </div>

        {/* Event Details Section */}
        <div className="form-row">
          <label htmlFor="event_date">Event Date*</label>
          <div className="date-input-wrapper">
            <input
              type="text"
              id="event_date"
              name="event_date"
              value={eventData.event_date ? (() => {
                try {
                  const date = new Date(eventData.event_date);
                  return isNaN(date.getTime()) ? eventData.event_date : date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                } catch {
                  return eventData.event_date;
                }
              })() : ''}
              readOnly
              placeholder="MM/DD/YYYY"
              className={`date-input ${fieldErrors.event_date ? 'error' : ''}`}
              required
            />
            <span className="input-icon">📅</span>
            {!isEventLocked && (
              <div className="calendar-inline">
                <Calendar
                  selectedDate={eventData.event_date}
                  onDateSelect={handleDateSelect}
                  onAvailabilityCheck={(date: string) => checkDateAvailability(date)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="event_start_time">Event Start Time*</label>
          <div className="time-input-wrapper">
            <input
              type="time"
              id="event_start_time"
              name="event_start_time"
              value={eventData.event_start_time}
              onChange={handleEventInputChange}
              required
              className={`time-input ${fieldErrors.event_start_time ? 'error' : ''}`}
            />
            <span className="input-icon">🕐</span>
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="event_end_time">Event Finish Time</label>
          <div className="time-input-wrapper">
            <input
              type="time"
              id="event_end_time"
              name="event_end_time"
              value={eventData.event_end_time}
              onChange={handleEventInputChange}
              className={`time-input ${fieldErrors.event_end_time ? 'error' : ''}`}
            />
            <span className="input-icon">🕐</span>
          </div>
        </div>

        {/* Overnight Option */}
        <div className="form-row">
          <label></label>
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              id="overnight_pickup"
              checked={overnightPickup}
              onChange={(e) => setOvernightPickup(e.target.checked)}
            />
            <label htmlFor="overnight_pickup">$75.00 pick up inflatable next morning</label>
          </div>
        </div>

        {/* Items Selection */}
        <div className="form-row">
          <label>Items*</label>
          <div className="items-grid">
            {inflatablesData.map((inflatable) => (
              <div key={inflatable.id} className="item-checkbox-wrapper">
                <input
                  type="checkbox"
                  id={`item-${inflatable.id}`}
                  checked={selectedItems.has(inflatable.id)}
                  onChange={() => handleItemToggle(inflatable.id)}
                />
                <label htmlFor={`item-${inflatable.id}`}>
                  {inflatable.name} ${inflatable.price.toFixed(0)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Surface Selection */}
        <div className="form-row">
          <label>Surface to set up*</label>
          <div className="radio-group">
            <div className="radio-option">
              <input
                type="radio"
                id="surface-grass-front"
                name="surface"
                value="Front Yard Grass"
                checked={surfaceType === 'Front Yard Grass'}
                onChange={(e) => setSurfaceType(e.target.value)}
              />
              <label htmlFor="surface-grass-front">Front Yard Grass</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="surface-grass-back"
                name="surface"
                value="Backyard Grass"
                checked={surfaceType === 'Backyard Grass'}
                onChange={(e) => setSurfaceType(e.target.value)}
              />
              <label htmlFor="surface-grass-back">Backyard Grass</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="surface-concrete"
                name="surface"
                value="Concrete"
                checked={surfaceType === 'Concrete'}
                onChange={(e) => setSurfaceType(e.target.value)}
              />
              <label htmlFor="surface-concrete">Concrete $30/sand bags fee</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="surface-asphalt"
                name="surface"
                value="Asphalt"
                checked={surfaceType === 'Asphalt'}
                onChange={(e) => setSurfaceType(e.target.value)}
              />
              <label htmlFor="surface-asphalt">Asphalt $30/sand bags fee</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="surface-indoor"
                name="surface"
                value="Indoor"
                checked={surfaceType === 'Indoor'}
                onChange={(e) => setSurfaceType(e.target.value)}
              />
              <label htmlFor="surface-indoor">Indoor $30/sand bags fee</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="surface-parking"
                name="surface"
                value="Parking Lot"
                checked={surfaceType === 'Parking Lot'}
                onChange={(e) => setSurfaceType(e.target.value)}
              />
              <label htmlFor="surface-parking">Parking Lot $30/sand bags fee</label>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="form-row">
          <label htmlFor="notes">Note</label>
          <textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="notes-textarea"
          />
        </div>

        {/* Submit Button */}
        <div className="form-row">
          <label></label>
          <button type="submit" className="btn btn-primary place-order-btn">
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
