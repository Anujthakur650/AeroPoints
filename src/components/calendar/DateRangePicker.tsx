import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  minDate?: Date;
  disabled?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = "Select dates",
  label,
  className = "",
  minDate,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value.start || new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectingEnd(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Format date range for display
  const formatDateRange = (range: DateRange): string => {
    if (!range.start && !range.end) return '';
    if (range.start && !range.end) return formatDate(range.start);
    if (range.start && range.end) {
      return `${formatDate(range.start)} - ${formatDate(range.end)}`;
    }
    return '';
  };

  // Get days in month
  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(year, month, -startingDayOfWeek + i + 1));
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Add days from next month to fill the grid
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(new Date(year, month + 1, day));
    }

    return days;
  };

  const handleDateClick = (date: Date) => {
    if (disabled) return;
    
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    if (!isCurrentMonth) return;

    if (minDate && date < minDate) return;

    if (!value.start || (value.start && value.end)) {
      // Starting new selection
      onChange({ start: date, end: null });
      setSelectingEnd(true);
    } else if (value.start && !value.end) {
      // Selecting end date
      if (date < value.start) {
        // If selected date is before start, make it the new start
        onChange({ start: date, end: value.start });
      } else {
        // Normal end date selection
        onChange({ start: value.start, end: date });
      }
      setSelectingEnd(false);
      setIsOpen(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const isDateDisabled = (date: Date): boolean => {
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    if (!isCurrentMonth) return true;
    if (minDate && date < minDate) return true;
    return false;
  };

  const isDateInRange = (date: Date): boolean => {
    if (!value.start || !value.end) return false;
    return date >= value.start && date <= value.end;
  };

  const isDateInHoverRange = (date: Date): boolean => {
    if (!value.start || !hoverDate || value.end) return false;
    const start = value.start;
    const end = hoverDate;
    const minDate = start < end ? start : end;
    const maxDate = start < end ? end : start;
    return date >= minDate && date <= maxDate;
  };

  const isDateRangeStart = (date: Date): boolean => {
    return value.start ? date.toDateString() === value.start.toDateString() : false;
  };

  const isDateRangeEnd = (date: Date): boolean => {
    return value.end ? date.toDateString() === value.end.toDateString() : false;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-2">
          <Icon icon="lucide:calendar" className="inline mr-2 text-[#FFD700]" width={16} height={16} />
          {label}
        </label>
      )}
      
      {/* Input Field */}
      <div
        className={`
          relative h-14 px-4 rounded-xl cursor-pointer transition-all duration-300
          bg-white/5 backdrop-blur-lg border border-white/20
          hover:bg-white/10 hover:border-[#FFD700]/30
          focus-within:border-[#FFD700] focus-within:bg-white/10
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isOpen ? 'border-[#FFD700] bg-white/10' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between h-full">
          <span className={`text-lg font-medium ${(value.start || value.end) ? 'text-white' : 'text-gray-400'}`}>
            {formatDateRange(value) || placeholder}
          </span>
          <Icon 
            icon="lucide:calendar" 
            className={`text-[#FFD700] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            width={20} 
            height={20} 
          />
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full min-w-[320px]">
          <div className="bg-slate-900/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Icon icon="lucide:chevron-left" className="text-white" width={20} height={20} />
              </button>
              
              <h3 className="text-white font-semibold text-lg">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Icon icon="lucide:chevron-right" className="text-white" width={20} height={20} />
              </button>
            </div>

            {/* Selection Status */}
            {selectingEnd && value.start && (
              <div className="mb-4 p-2 bg-[#FFD700]/10 rounded-lg border border-[#FFD700]/30">
                <p className="text-[#FFD700] text-sm text-center">
                  Select return date (departure: {formatDate(value.start)})
                </p>
              </div>
            )}

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((date, index) => {
                const isDisabled = isDateDisabled(date);
                const isInRange = isDateInRange(date);
                const isInHoverRange = isDateInHoverRange(date);
                const isRangeStart = isDateRangeStart(date);
                const isRangeEnd = isDateRangeEnd(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => setHoverDate(date)}
                    onMouseLeave={() => setHoverDate(null)}
                    disabled={isDisabled}
                    className={`
                      h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200
                      flex items-center justify-center relative
                      ${isRangeStart || isRangeEnd
                        ? 'bg-[#FFD700] text-black font-bold z-10' 
                        : isInRange
                        ? 'bg-[#FFD700]/30 text-[#FFD700]'
                        : isInHoverRange
                        ? 'bg-[#FFD700]/20 text-[#FFD700]'
                        : isToday
                        ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/50'
                        : isDisabled
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-white hover:bg-white/10 hover:text-[#FFD700]'
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Clear Selection Button */}
            {(value.start || value.end) && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    onChange({ start: null, end: null });
                    setSelectingEnd(false);
                  }}
                  className="w-full py-2 px-4 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
