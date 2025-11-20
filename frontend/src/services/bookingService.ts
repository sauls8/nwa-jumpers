/**
 * Booking Service
 * Handles submitting quotes with multiple items to the backend API
 */

import { getApiUrl } from '../config/api';
import type { CartItem, CustomerInfo, QuoteInfo } from '../types/cart';

const API_BASE_URL = getApiUrl('bookings');

export interface QuoteSubmissionResponse {
  success: boolean;
  message: string;
  booking_id?: number;
}

/**
 * Submit a single quote with multiple items
 */
export const submitQuote = async (
  customerInfo: CustomerInfo,
  cartItems: CartItem[],
  quoteInfo: QuoteInfo,
  eventDate: string,
  eventStartTime: string,
  eventEndTime: string
): Promise<QuoteSubmissionResponse> => {
  try {
    // Validate required fields
    if (!customerInfo.customer_name || !customerInfo.customer_email || !customerInfo.customer_phone) {
      throw new Error('Missing required customer information');
    }

    if (!eventDate || !eventStartTime || !eventEndTime) {
      throw new Error('Missing required event information');
    }

    if (!cartItems || cartItems.length === 0) {
      throw new Error('At least one item is required');
    }

    // Prepare items for submission (cart items no longer have date/time, it's shared)
    const items = cartItems.map(item => {
      if (!item.inflatable || !item.inflatable.name) {
        throw new Error('Invalid inflatable in cart');
      }
      return {
        product_name: item.inflatable.name,
        product_category: item.inflatable.category || null,
        quantity: 1,
        unit_price: item.inflatable.price || 0,
        total_price: item.inflatable.price || 0
      };
    });

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + tax;

    // Prepare quote payload
    const payload = {
      customer_name: customerInfo.customer_name.trim(),
      customer_email: customerInfo.customer_email.trim(),
      customer_phone: customerInfo.customer_phone.trim(),
      event_date: eventDate,
      event_start_time: eventStartTime,
      event_end_time: eventEndTime,
      organization_name: quoteInfo.organization_name || null,
      event_address: quoteInfo.event_address || null,
      event_surface: quoteInfo.event_surface || null,
      event_is_indoor: quoteInfo.event_is_indoor || false,
      items: items,
      subtotal_amount: subtotal,
      tax_amount: tax,
      total_amount: total
    };

    const response = await fetch(`${API_BASE_URL}/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      // Chrome-specific: ensure proper request handling
      cache: 'no-cache',
      credentials: 'omit'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: QuoteSubmissionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting quote:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit quote',
    };
  }
};

/**
 * Download PDF for a booking (Chrome-compatible)
 */
export const downloadQuotePDF = async (bookingId: number): Promise<void> => {
  try {
    // Validate bookingId
    if (!bookingId || typeof bookingId !== 'number' || isNaN(bookingId)) {
      throw new Error('Invalid booking ID');
    }

    const response = await fetch(`${API_BASE_URL}/${bookingId}/pdf`, {
      method: 'GET',
      cache: 'no-cache',
      credentials: 'omit'
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to generate PDF: ${response.status} ${errorText}`);
    }

    const blob = await response.blob();
    
    // Chrome-compatible blob handling
    if (typeof window === 'undefined' || !window.URL || !window.URL.createObjectURL) {
      throw new Error('Browser does not support file downloads');
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${bookingId}.pdf`;
    a.style.display = 'none'; // Chrome requires hidden element
    document.body.appendChild(a);
    
    // Use setTimeout for Chrome compatibility
    setTimeout(() => {
      try {
        a.click();
        // Cleanup after a delay to ensure download starts
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          if (a.parentNode) {
            document.body.removeChild(a);
          }
        }, 100);
      } catch (clickError) {
        console.error('Error triggering download:', clickError);
        window.URL.revokeObjectURL(url);
        if (a.parentNode) {
          document.body.removeChild(a);
        }
        throw clickError;
      }
    }, 0);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};
