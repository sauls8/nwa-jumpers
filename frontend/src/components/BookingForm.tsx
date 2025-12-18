import React, { useState, useEffect } from 'react';
import './BookingForm.css';
import type { Inflatable } from '../services/inventoryService';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (!isEventLocked) {
      const formData = {
        customerForm,
        eventData,
        overnightPickup,
        surfaceType,
        notes
      };
      try {
        localStorage.setItem('nwa-jumpers-form-draft', JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving form to localStorage:', error);
      }
    }
  }, [customerForm, eventData, overnightPickup, surfaceType, notes, isEventLocked]);

  // Load form data from localStorage on mount (if not locked)
  useEffect(() => {
    if (!isEventLocked && !customerInfo) {
      try {
        const saved = localStorage.getItem('nwa-jumpers-form-draft');
        if (saved) {
          const formData = JSON.parse(saved);
          if (formData.customerForm) {
            setCustomerForm(formData.customerForm);
          }
          if (formData.eventData) {
            setEventData(formData.eventData);
          }
          if (formData.overnightPickup !== undefined) {
            setOvernightPickup(formData.overnightPickup);
          }
          if (formData.surfaceType) {
            setSurfaceType(formData.surfaceType);
          }
          if (formData.notes) {
            setNotes(formData.notes);
          }
        }
      } catch (error) {
        console.error('Error loading form from localStorage:', error);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


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

    // Validate that an inflatable was selected
    if (!selectedInflatable || !selectedInflatable.id) {
      setError('Please select an inflatable to continue');
      return false;
    }

    // Validate surface type if required
    if (!surfaceType) {
      setError('Please select a surface type');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      if (!validateForm()) {
        setIsSubmitting(false);
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

      // Add the selected inflatable to cart
      if (selectedInflatable) {
        const cartItem: CartItem = {
          id: `${selectedInflatable.id}-${Date.now()}-${Math.random()}`,
          inflatable: selectedInflatable
        };
        onAddToCart(cartItem, newEventInfo);
      }
      
      // Clear localStorage after successful submission
      try {
        localStorage.removeItem('nwa-jumpers-form-draft');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }

      // Show success message and option to proceed
      setShowAddMorePrompt(true);
      
      // Clear field errors
      setFieldErrors({});
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
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
            <p>1 item has been added to your cart.</p>
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
        <h2>Booking Form</h2>
        <p className="form-subtitle">Fill out the form below to complete your rental booking</p>
      </div>

      <form onSubmit={handleSubmit} className="order-form">
        {error && <div className="error-message">{error}</div>}
        
        {/* Section 1: Contact Information */}
        <div className="form-section">
          <div className="form-section-header">
            <h3>1. Contact Information</h3>
            <p className="section-description">Tell us how to reach you</p>
          </div>
          
          <div className="form-section-content">
            <div className="form-row">
              <label htmlFor="first_name">Contact Name*</label>
              <div className="input-group">
                <div className="name-inputs">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      placeholder="First"
                      value={customerForm.first_name || ''}
                      onChange={handleCustomerInputChange}
                      className={fieldErrors.first_name ? 'error' : (customerForm.first_name ? 'valid' : '')}
                    />
                    {customerForm.first_name && !fieldErrors.first_name && <span className="field-success">✓</span>}
                  </div>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      placeholder="Last"
                      value={customerForm.last_name || ''}
                      onChange={handleCustomerInputChange}
                      className={fieldErrors.last_name ? 'error' : (customerForm.last_name ? 'valid' : '')}
                    />
                    {customerForm.last_name && !fieldErrors.last_name && <span className="field-success">✓</span>}
                  </div>
                </div>
                {fieldErrors.first_name && <span className="field-error-inline">{fieldErrors.first_name}</span>}
                {fieldErrors.last_name && <span className="field-error-inline">{fieldErrors.last_name}</span>}
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="customer_email">Email*</label>
              <div className="input-group">
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="customer_email"
                    name="customer_email"
                    value={customerForm.customer_email}
                    onChange={handleCustomerInputChange}
                    required
                    className={fieldErrors.customer_email ? 'error' : (customerForm.customer_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.customer_email) ? 'valid' : '')}
                  />
                  {customerForm.customer_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.customer_email) && !fieldErrors.customer_email && <span className="field-success">✓</span>}
                </div>
                {fieldErrors.customer_email && <span className="field-error-inline">{fieldErrors.customer_email}</span>}
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="customer_phone">Phone*</label>
              <div className="input-group">
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="customer_phone"
                    name="customer_phone"
                    placeholder="### ### ####"
                    value={customerForm.customer_phone}
                    onChange={handleCustomerInputChange}
                    required
                    className={fieldErrors.customer_phone ? 'error' : (customerForm.customer_phone && customerForm.customer_phone.length >= 14 ? 'valid' : '')}
                  />
                  {customerForm.customer_phone && customerForm.customer_phone.length >= 14 && !fieldErrors.customer_phone && <span className="field-success">✓</span>}
                </div>
                {fieldErrors.customer_phone && <span className="field-error-inline">{fieldErrors.customer_phone}</span>}
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="company_name">Company Name <span className="optional-label">(Optional)</span></label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={customerForm.company_name || ''}
                onChange={handleCustomerInputChange}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Delivery Address */}
        <div className="form-section">
          <div className="form-section-header">
            <h3>2. Delivery Address</h3>
            <p className="section-description">Where should we deliver your rental?</p>
          </div>
          
          <div className="form-section-content">

            <div className="form-row">
              <label>Street Address*</label>
              <div className="input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="street_address"
                    placeholder="123 Main Street"
                    value={customerForm.street_address || ''}
                    onChange={handleCustomerInputChange}
                    className={fieldErrors.street_address ? 'error' : (customerForm.street_address ? 'valid' : '')}
                  />
                  {customerForm.street_address && !fieldErrors.street_address && <span className="field-success">✓</span>}
                </div>
                {fieldErrors.street_address && <span className="field-error-inline">{fieldErrors.street_address}</span>}
              </div>
            </div>

            <div className="form-row">
              <label>City*</label>
              <div className="input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={customerForm.city || ''}
                    onChange={handleCustomerInputChange}
                    className={fieldErrors.city ? 'error' : (customerForm.city ? 'valid' : '')}
                  />
                  {customerForm.city && !fieldErrors.city && <span className="field-success">✓</span>}
                </div>
                {fieldErrors.city && <span className="field-error-inline">{fieldErrors.city}</span>}
              </div>
            </div>

            <div className="form-row-group">
              <div className="form-row">
                <label>State*</label>
                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="state"
                      placeholder="AR"
                      value={customerForm.state || ''}
                      onChange={handleCustomerInputChange}
                      className={fieldErrors.state ? 'error' : (customerForm.state ? 'valid' : '')}
                    />
                    {customerForm.state && !fieldErrors.state && <span className="field-success">✓</span>}
                  </div>
                  {fieldErrors.state && <span className="field-error-inline">{fieldErrors.state}</span>}
                </div>
              </div>

              <div className="form-row">
                <label>Zip Code*</label>
                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="postal_code"
                      placeholder="72701"
                      value={customerForm.postal_code || ''}
                      onChange={handleCustomerInputChange}
                      className={fieldErrors.postal_code ? 'error' : (customerForm.postal_code ? 'valid' : '')}
                    />
                    {customerForm.postal_code && !fieldErrors.postal_code && <span className="field-success">✓</span>}
                  </div>
                  {fieldErrors.postal_code && <span className="field-error-inline">{fieldErrors.postal_code}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Event Details */}
        <div className="form-section">
          <div className="form-section-header">
            <h3>3. Event Details</h3>
            <p className="section-description">When is your event?</p>
          </div>
          
          <div className="form-section-content">
            <div className="form-row">
              <label htmlFor="event_date">Event Date*</label>
              <div className="input-group">
                <div className="date-input-wrapper">
                  <div className="input-wrapper">
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
                      className={`date-input ${fieldErrors.event_date ? 'error' : (eventData.event_date ? 'valid' : '')}`}
                      required
                    />
                    <span className="input-icon">📅</span>
                    {eventData.event_date && !fieldErrors.event_date && <span className="field-success">✓</span>}
                  </div>
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
                {fieldErrors.event_date && <span className="field-error-inline">{fieldErrors.event_date}</span>}
              </div>
            </div>

            <div className="form-row-group">
              <div className="form-row">
                <label htmlFor="event_start_time">Start Time*</label>
                <div className="input-group">
                  <div className="time-input-wrapper">
                    <div className="input-wrapper">
                      <input
                        type="time"
                        id="event_start_time"
                        name="event_start_time"
                        value={eventData.event_start_time}
                        onChange={handleEventInputChange}
                        required
                        className={`time-input ${fieldErrors.event_start_time ? 'error' : (eventData.event_start_time ? 'valid' : '')}`}
                      />
                      <span className="input-icon">🕐</span>
                      {eventData.event_start_time && !fieldErrors.event_start_time && <span className="field-success">✓</span>}
                    </div>
                  </div>
                  {fieldErrors.event_start_time && <span className="field-error-inline">{fieldErrors.event_start_time}</span>}
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="event_end_time">End Time*</label>
                <div className="input-group">
                  <div className="time-input-wrapper">
                    <div className="input-wrapper">
                      <input
                        type="time"
                        id="event_end_time"
                        name="event_end_time"
                        value={eventData.event_end_time}
                        onChange={handleEventInputChange}
                        className={`time-input ${fieldErrors.event_end_time ? 'error' : (eventData.event_end_time ? 'valid' : '')}`}
                      />
                      <span className="input-icon">🕐</span>
                      {eventData.event_end_time && !fieldErrors.event_end_time && <span className="field-success">✓</span>}
                    </div>
                  </div>
                  {fieldErrors.event_end_time && <span className="field-error-inline">{fieldErrors.event_end_time}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Setup Details */}
        <div className="form-section">
          <div className="form-section-header">
            <h3>4. Setup Details</h3>
            <p className="section-description">Tell us about your setup location</p>
          </div>
          
          <div className="form-section-content">
            <div className="form-row">
              <label>Surface Type*</label>
              <div className="surface-selection">
                <div className="surface-group">
                  <div className="surface-group-label">Grass (No additional fee)</div>
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
                  </div>
                </div>
                
                <div className="surface-group">
                  <div className="surface-group-label">Hard Surfaces <span className="fee-note">($30 sand bags fee)</span></div>
                  <div className="radio-group">
                    <div className="radio-option">
                      <input
                        type="radio"
                        id="surface-concrete"
                        name="surface"
                        value="Concrete"
                        checked={surfaceType === 'Concrete'}
                        onChange={(e) => setSurfaceType(e.target.value)}
                      />
                      <label htmlFor="surface-concrete">Concrete</label>
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
                      <label htmlFor="surface-asphalt">Asphalt</label>
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
                      <label htmlFor="surface-indoor">Indoor</label>
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
                      <label htmlFor="surface-parking">Parking Lot</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <label></label>
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="overnight_pickup"
                  checked={overnightPickup}
                  onChange={(e) => setOvernightPickup(e.target.checked)}
                />
                <label htmlFor="overnight_pickup">
                  <strong>Overnight Pickup</strong> - Pick up next morning (+$75.00)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Additional Notes */}
        <div className="form-section">
          <div className="form-section-header">
            <h3>5. Additional Notes <span className="optional-label">(Optional)</span></h3>
            <p className="section-description">Any special instructions or requests?</p>
          </div>
          
          <div className="form-section-content">
            <div className="form-row">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="notes-textarea"
                placeholder="Special delivery instructions, access codes, gate information, etc."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary add-to-cart-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner">⏳</span>
                Adding to Cart...
              </>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;

