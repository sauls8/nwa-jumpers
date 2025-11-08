import React, { useState, useEffect } from 'react';
import './Calendar.css';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onAvailabilityCheck?: (date: string) => Promise<boolean>;
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
  onAvailabilityCheck 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate calendar days for current month
  const generateDays = (date: Date): DayData[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    
    // Start from Sunday of the first week
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: DayData[] = [];
    const currentDate = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = dateStr === today.toISOString().split('T')[0];
      const isSelected = dateStr === selectedDate;
      
      days.push({
        date: dateStr,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isAvailable: false, // Will be updated by availability check
        isBooked: false
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Check availability for all days
  const checkAvailability = async (days: DayData[]): Promise<DayData[]> => {
    if (!onAvailabilityCheck) return days;
    
    setLoading(true);
    const updatedDays = await Promise.all(
      days.map(async (day) => {
        if (!day.isCurrentMonth) return day;
        
        try {
          const isAvailable = await onAvailabilityCheck(day.date);
          return { ...day, isAvailable, isBooked: !isAvailable };
        } catch (error) {
          console.error(`Error checking availability for ${day.date}:`, error);
          return day;
        }
      })
    );
    
    setLoading(false);
    return updatedDays;
  };

  // Update days when month changes
  useEffect(() => {
    const newDays = generateDays(currentDate);
    checkAvailability(newDays).then(setDays);
  }, [currentDate, onAvailabilityCheck]);

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
    if (day.isCurrentMonth && !day.isBooked) {
      onDateSelect(day.date);
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
