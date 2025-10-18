/**
 * Availability Service
 * Handles checking date availability with the backend API
 */

const API_BASE_URL = 'http://localhost:3001/api';

export interface AvailabilityResponse {
  date: string;
  isAvailable: boolean;
  bookingsCount: number;
  message: string;
}

/**
 * Check if a specific date is available for booking
 */
export const checkDateAvailability = async (date: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/availability/${date}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: AvailabilityResponse = await response.json();
    return data.isAvailable;
  } catch (error) {
    console.error('Error checking date availability:', error);
    // Return true as fallback to allow booking attempts
    return true;
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
