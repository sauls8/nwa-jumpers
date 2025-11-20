/**
 * Availability Service
 * Handles checking date availability with the backend API
 */

import { API_BASE_URL } from '../config/api';

export interface AvailabilityResponse {
  date: string;
  isAvailable: boolean;
  bookingsCount: number;
  message: string;
}

/**
 * Check if a specific date is available for booking
 * @param date - Date string in YYYY-MM-DD format
 * @param inflatableType - Optional inflatable type to check availability for
 */
export const checkDateAvailability = async (date: string, inflatableType?: string): Promise<boolean> => {
  // Validate date format
  if (!date || typeof date !== 'string') {
    console.error('Invalid date provided to checkDateAvailability');
    return false;
  }

  // Validate date is a valid date string
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date format:', date);
    return false;
  }

  try {
    let url = `${API_BASE_URL}/bookings/availability/${date}`;
    if (inflatableType && typeof inflatableType === 'string') {
      url += `?inflatable=${encodeURIComponent(inflatableType)}`;
    }
    
    // Use timeout with AbortController (Chrome-compatible)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 second timeout
    
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        cache: 'no-cache' // Chrome-specific: prevent caching issues
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw fetchError;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: AvailabilityResponse = await response.json();
    
    // Validate response structure
    if (typeof data === 'object' && 'isAvailable' in data) {
      return Boolean(data.isAvailable);
    }
    
    console.error('Invalid response structure from availability API');
    return false;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Availability check timed out');
    } else {
      console.error('Error checking date availability:', error);
    }
    return false; // Default to unavailable on error for safety
  }
};

/**
 * Check availability for multiple dates
 */
export const checkMultipleDatesAvailability = async (dates: string[]): Promise<Record<string, boolean>> => {
  try {
    const promises = dates.map(async (date) => {
      const isAvailable = await checkDateAvailability(date);
      return { date, isAvailable };
    });
    
    const results = await Promise.all(promises);
    
    return results.reduce((acc, { date, isAvailable }) => {
      acc[date] = isAvailable;
      return acc;
    }, {} as Record<string, boolean>);
  } catch (error) {
    console.error('Error checking multiple dates availability:', error);
    // Return all dates as available as fallback
    return dates.reduce((acc, date) => {
      acc[date] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }
};

/**
 * Format date for API calls (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (date: string): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Get the next available date (not in the past)
 */
export const getNextAvailableDate = (): string => {
  const today = new Date();
  return formatDateForAPI(today);
};
