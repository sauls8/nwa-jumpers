import React, { useState, useEffect } from 'react';
import './Calendar.css';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onAvailabilityCheck?: (date: string) => Promise<boolean>;
  datesWithBookings?: string[]; // For admin: dates that have bookings (will be blue)
  showBookingsOnly?: boolean; // For admin: only show dates with bookings as clickable
}

interface DayData {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isAvailable: boolean;
  isBooked: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ 
  selectedDate, 
  onDateSelect, 
  onAvailabilityCheck,
  datesWithBookings = [],
  showBookingsOnly = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);

  // Format date as YYYY-MM-DD in local timezone (fixes off-by-one error)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate calendar days for current month
  const generateDays = (date: Date): DayData[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    const todayStr = formatDateLocal(today);
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    
    // Start from Sunday of the first week
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: DayData[] = [];
    const currentDate = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateStr = formatDateLocal(currentDate);
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;
      
      // Check if this date has bookings (for admin view)
      const hasBookings = datesWithBookings.includes(dateStr);
      
      days.push({
        date: dateStr,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isAvailable: false, // Will be updated by availability check
        isBooked: hasBookings // For admin: days with bookings are "booked"
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Check availability for all days with error handling
  const checkAvailability = async (days: DayData[]): Promise<DayData[]> => {
    if (!onAvailabilityCheck || typeof onAvailabilityCheck !== 'function') {
      return days;
    }
    
    setLoading(true);
    try {
      // Only check current month days to reduce API calls
      const currentMonthDays = days.filter(day => day.isCurrentMonth && day.date);
      
      // Batch availability checks with error handling
      const availabilityPromises = currentMonthDays.map(async (day) => {
        if (!day.date) return { date: day.date, isAvailable: true };
        
        try {
          const isAvailable = await onAvailabilityCheck(day.date);
          return { date: day.date, isAvailable: Boolean(isAvailable) };
        } catch (error) {
          console.error(`Error checking availability for ${day.date}:`, error);
          return { date: day.date, isAvailable: true }; // Default to available on error
        }
      });
      
      const availabilityResults = await Promise.all(availabilityPromises);
      const availabilityMap = new Map(
        availabilityResults.map(result => [result.date, result.isAvailable])
      );
      
      // Update days with availability results
      const updatedDays = days.map(day => {
        if (day.isCurrentMonth && day.date) {
          const isAvailable = availabilityMap.get(day.date) ?? true;
          return {
            ...day,
            isAvailable,
            isBooked: !isAvailable
          };
        }
        return day;
      });
      
      setLoading(false);
      return updatedDays;
    } catch (error) {
      console.error('Error in checkAvailability:', error);
      setLoading(false);
      return days; // Return original days on error
    }
  };

  // Update days when month changes
  useEffect(() => {
    let isMounted = true;
    let cancelled = false;
    
    const updateDays = async () => {
      if (cancelled) return;
      
      const newDays = generateDays(currentDate);
      
      // Always set initial days first (for immediate UI update)
      if (isMounted && !cancelled) {
        setDays(newDays);
      }
      
      // Then check availability if function provided
      if (onAvailabilityCheck && typeof onAvailabilityCheck === 'function' && !cancelled) {
        try {
          const updatedDays = await checkAvailability(newDays);
          if (isMounted && !cancelled) {
            setDays(updatedDays);
          }
        } catch (error) {
          console.error('Error updating calendar days:', error);
          // Keep the initial days on error
        }
      }
    };

    updateDays();

    return () => {
      isMounted = false;
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]); // Only depend on currentDate, not onAvailabilityCheck

  // Update days when selected date changes
  useEffect(() => {
    setDays(prevDays => 
      prevDays.map(day => ({
        ...day,
        isSelected: day.date === selectedDate
      }))
    );
  }, [selectedDate]);

  const handleDateClick = (day: DayData) => {
    try {
      if (day && day.isCurrentMonth && day.date) {
        // For admin view: allow clicking on days with bookings
        // For booking form: don't allow clicking on booked days
        if (showBookingsOnly) {
          // Admin mode: only allow clicking days with bookings
          if (day.isBooked) {
            onDateSelect(day.date);
          }
        } else {
          // Booking form mode: don't allow clicking booked days
          if (!day.isBooked) {
            onDateSelect(day.date);
          }
        }
      }
    } catch (error) {
      console.error('Error handling date click:', error);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="calendar-nav-btn">
          ←
        </button>
        <h3 className="calendar-title">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button onClick={handleNextMonth} className="calendar-nav-btn">
          →
        </button>
      </div>
      
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => (
          <div
            key={`${day.date}-${index}`}
            className={`calendar-day ${
              !day.isCurrentMonth ? 'other-month' : ''
            } ${day.isToday ? 'today' : ''} ${
              day.isSelected ? 'selected' : ''
            } ${day.isBooked ? 'booked' : ''} ${
              day.isAvailable ? 'available' : ''
            } ${!day.isCurrentMonth || day.isBooked ? 'disabled' : ''}`}
            onClick={() => handleDateClick(day)}
          >
            {day.day}
          </div>
        ))}
      </div>
      
      <div className="calendar-footer">
        <button onClick={handleToday} className="today-btn">
          Today
        </button>
        {loading && <div className="loading-indicator">Checking availability...</div>}
      </div>
      
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color booked"></div>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
