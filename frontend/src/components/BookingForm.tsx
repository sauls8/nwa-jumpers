import React, { useState } from 'react';
import './BookingForm.css';
import type { Inflatable } from '../data/inflatables';
import Calendar from './Calendar';
import { checkDateAvailability } from '../services/availabilityService';

interface BookingData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  bounce_house_type: string;
}

interface BookingFormProps {
  selectedCategory?: string;
  selectedInflatable?: Inflatable | null;
}


const BookingForm: React.FC<BookingFormProps> = ({ selectedCategory, selectedInflatable }) => {
  const [formData, setFormData] = useState<BookingData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    event_date: '',
    event_start_time: '',
    event_end_time: '',
    bounce_house_type: selectedInflatable?.name || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateSelect = (date: string) => {
    setFormData(prev => ({
      ...prev,
      event_date: date
    }));
    setShowCalendar(false);
  };

  const handleCalendarToggle = () => {
    setShowCalendar(!showCalendar);
  };

  const validateForm = (): boolean => {
    if (!formData.customer_name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.customer_email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.customer_phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.event_date) {
      setError('Event date is required');
      return false;
    }
    if (!formData.event_start_time) {
      setError('Event start time is required');
      return false;
    }
    if (!formData.event_end_time) {
      setError('Event end time is required');
      return false;
    }
    if (!formData.bounce_house_type) {
      setError('Please select a bounce house type');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        setFormData({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          event_date: '',
          event_start_time: '',
          event_end_time: '',
          bounce_house_type: ''
        });
      } else {
        setError(result.message || 'Failed to create booking');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="booking-success">
        <h3>🎉 Booking Submitted Successfully!</h3>
        <p>Thank you for choosing NWA Jumpers! We'll contact you soon to confirm your booking.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="btn btn-secondary"
        >
          Make Another Booking
        </button>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      <h2>Book Your Bounce House</h2>
      {selectedCategory && (
        <div className="selected-category">
          <p>Selected Category: <strong>{selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</strong></p>
        </div>
      )}
      
      {selectedInflatable && (
        <div className="selected-inflatable">
          <div className="inflatable-info">
            <div className="inflatable-image">
              <img src={selectedInflatable.image} alt={selectedInflatable.name} />
            </div>
            <div className="inflatable-details">
              <h3>{selectedInflatable.name}</h3>
              <p className="inflatable-price">${selectedInflatable.price}</p>
              <p className="inflatable-description">{selectedInflatable.description}</p>
              <div className="inflatable-specs">
                <span><strong>Capacity:</strong> {selectedInflatable.capacity}</span>
                <span><strong>Size:</strong> {selectedInflatable.dimensions}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="booking-form">
        {error && <div className="error-message">{error}</div>}
        
        
        
        <div className="form-group">
          <label htmlFor="customer_name">Full Name *</label>
          <input
            type="text"
            id="customer_name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="customer_email">Email Address *</label>
          <input
            type="email"
            id="customer_email"
            name="customer_email"
            value={formData.customer_email}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="customer_phone">Phone Number *</label>
          <input
            type="tel"
            id="customer_phone"
            name="customer_phone"
            value={formData.customer_phone}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="event_date">Event Date *</label>
          <div className="date-input-container">
            <input
              type="text"
              id="event_date"
              name="event_date"
              value={formData.event_date ? new Date(formData.event_date).toLocaleDateString() : ''}
              onClick={handleCalendarToggle}
              readOnly
              placeholder="Click to select date"
              className="date-input"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleCalendarToggle}
              className="calendar-toggle-btn"
              disabled={isLoading}
            >
              📅
            </button>
          </div>
          {showCalendar && (
            <div className="calendar-container">
              <Calendar
                selectedDate={formData.event_date}
                onDateSelect={handleDateSelect}
                onAvailabilityCheck={checkDateAvailability}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="event_start_time">Event Start Time *</label>
          <input
            type="time"
            id="event_start_time"
            name="event_start_time"
            value={formData.event_start_time}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="event_end_time">Event End Time *</label>
          <input
            type="time"
            id="event_end_time"
            name="event_end_time"
            value={formData.event_end_time}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </div>

        {/* <div className="form-group">
          <label htmlFor="bounce_house_type">Bounce House Type *</label>
          <select
            id="bounce_house_type"
            name="bounce_house_type"
            value={formData.bounce_house_type}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          >
            <option value="">Select a bounce house...</option>
            {BOUNCE_HOUSE_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div> */}

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit Booking'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
