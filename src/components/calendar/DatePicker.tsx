import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  minDate?: Date;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  label,
  className = "",
  minDate,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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

    onChange(date);
    setIsOpen(false);
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

  const isDateSelected = (date: Date): boolean => {
    if (!value) return false;
    return date.toDateString() === value.toDateString();
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
        ref={inputRef}
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
          <span className={`text-lg font-medium ${value ? 'text-white' : 'text-gray-400'}`}>
            {value ? formatDate(value) : placeholder}
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
                const isSelected = isDateSelected(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    disabled={isDisabled}
                    className={`
                      h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200
                      flex items-center justify-center
                      ${isSelected 
                        ? 'bg-[#FFD700] text-black font-bold' 
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
          </div>
        </div>
      )}
    </div>
  );
};
