import React, { useState, useEffect, useRef } from 'react';
import dateService from '../../services/dateService';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';

const JalaliCalendar = ({
  value,
  onChange,
  onSelect,
  minDate,
  maxDate,
  calendar = 'jalali',
  locale = 'en',
  format = 'YYYY/MM/DD',
  placeholder = 'Select date',
  className = '',
  disabled = false,
  error,
  label,
  name,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [view, setView] = useState('days'); // 'days', 'months', 'years'
  const containerRef = useRef(null);
  
  const currentJalali = dateService.getTodayJalali();
  const currentYear = currentJalali.year;
  const currentMonth = currentJalali.month;
  
  // Parse initial value
  useEffect(() => {
    if (value) {
      if (value instanceof Date) {
        const jDate = dateService.gregorianToJalali(value);
        setSelectedDate(jDate);
        setInputValue(dateService.formatDate(value, format, calendar, locale));
        setViewYear(jDate.year);
        setViewMonth(jDate.month);
      } else if (typeof value === 'string') {
        const parsed = dateService.parseDate(value, calendar);
        if (parsed) {
          const jDate = dateService.gregorianToJalali(parsed);
          setSelectedDate(jDate);
          setInputValue(value);
          setViewYear(jDate.year);
          setViewMonth(jDate.month);
        }
      }
    }
  }, [value, format, calendar, locale]);
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const getMonthDays = (year, month) => {
    return dateService.getJalaliMonthLength(year, month);
  };
  
  const getMonthStartDay = (year, month) => {
    const gregorianDate = dateService.jalaliToGregorian({ year, month, day: 1 });
    const firstDayOfMonth = new Date(gregorianDate.getFullYear(), gregorianDate.getMonth(), 1);
    // Get the day of week (0 = Saturday in Jalali calendar first day)
    return firstDayOfMonth.getDay();
  };
  
  const handleDateSelect = (day) => {
    const jDate = { year: viewYear, month: viewMonth, day };
    const gregorianDate = dateService.jalaliToGregorian(jDate);
    
    setSelectedDate(jDate);
    setInputValue(dateService.formatDate(gregorianDate, format, calendar, locale));
    setIsOpen(false);
    
    if (onChange) {
      onChange(gregorianDate);
    }
    if (onSelect) {
      onSelect(jDate, gregorianDate);
    }
  };
  
  const handleYearSelect = (year) => {
    setViewYear(year);
    setView('months');
  };
  
  const handleMonthSelect = (month) => {
    setViewMonth(month);
    setView('days');
  };
  
  const navigateMonth = (direction) => {
    if (view === 'days') {
      const newMonth = viewMonth + direction;
      if (newMonth > 12) {
        setViewMonth(1);
        setViewYear(viewYear + 1);
      } else if (newMonth < 1) {
        setViewMonth(12);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(newMonth);
      }
    }
  };
  
  const renderDaysView = () => {
    const daysInMonth = getMonthDays(viewYear, viewMonth);
    const startDay = getMonthStartDay(viewYear, viewMonth);
    const monthNames = getMonthNames();
    const dayNames = getDayNames();
    
    const days = [];
    
    // Day headers
    dayNames.forEach((day, index) => {
      days.push(
        <div key={`header-${index}`} className="calendar-day-header">
          {day}
        </div>
      );
    });
    
    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day-empty"></div>);
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate && 
                        selectedDate.year === viewYear && 
                        selectedDate.month === viewMonth && 
                        selectedDate.day === day;
      const isToday = currentYear === viewYear && 
                      currentMonth === viewMonth && 
                      currentJalali.day === day;
      
      days.push(
        <button
          key={day}
          type="button"
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </button>
      );
    }
    
    return (
      <div className="calendar-grid">
        <div className="calendar-header">
          <button 
            type="button"
            className="calendar-nav-btn" 
            onClick={() => navigateMonth(-1)}
          >
            <ChevronRightIcon />
          </button>
          <button 
            type="button"
            className="calendar-header-label"
            onClick={() => setView('months')}
          >
            {monthNames[viewMonth - 1]} {viewYear}
          </button>
          <button 
            type="button"
            className="calendar-nav-btn" 
            onClick={() => navigateMonth(1)}
          >
            <ChevronLeftIcon />
          </button>
        </div>
        <div className="calendar-days-grid">
          {days}
        </div>
      </div>
    );
  };
  
  const renderMonthsView = () => {
    const monthNames = getMonthNames();
    
    return (
      <div className="calendar-grid">
        <div className="calendar-header">
          <button 
            type="button"
            className="calendar-nav-btn" 
            onClick={() => setViewYear(viewYear - 1)}
          >
            <ChevronRightIcon />
          </button>
          <span className="calendar-header-label">{viewYear}</span>
          <button 
            type="button"
            className="calendar-nav-btn" 
            onClick={() => setViewYear(viewYear + 1)}
          >
            <ChevronLeftIcon />
          </button>
        </div>
        <div className="calendar-months-grid">
          {monthNames.map((month, index) => (
            <button
              key={index}
              type="button"
              className={`calendar-month ${viewMonth === index + 1 ? 'selected' : ''}`}
              onClick={() => handleMonthSelect(index + 1)}
            >
              {month}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  const renderYearsView = () => {
    const startYear = viewYear - 6;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);
    
    return (
      <div className="calendar-grid">
        <div className="calendar-header">
          <button 
            type="button"
            className="calendar-nav-btn" 
            onClick={() => setViewYear(viewYear - 12)}
          >
            <ChevronRightIcon />
          </button>
          <span className="calendar-header-label">{startYear} - {startYear + 11}</span>
          <button 
            type="button"
            className="calendar-nav-btn" 
            onClick={() => setViewYear(viewYear + 12)}
          >
            <ChevronLeftIcon />
          </button>
        </div>
        <div className="calendar-years-grid">
          {years.map(year => (
            <button
              key={year}
              type="button"
              className={`calendar-year ${currentYear === year ? 'today' : ''}`}
              onClick={() => handleYearSelect(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  const getMonthNames = () => {
    if (locale === 'fa') {
      return [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
      ];
    }
    return [
      'Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar',
      'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'
    ];
  };
  
  const getDayNames = () => {
    if (locale === 'fa') {
      return ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
    }
    return ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  };
  
  const handleClear = () => {
    setSelectedDate(null);
    setInputValue('');
    setIsOpen(false);
    if (onChange) {
      onChange(null);
    }
  };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    const parsed = dateService.parseDate(value, calendar);
    if (parsed && !isNaN(parsed.getTime())) {
      const jDate = dateService.gregorianToJalali(parsed);
      setSelectedDate(jDate);
      if (onChange) {
        onChange(parsed);
      }
    }
  };
  
  const handleInputFocus = () => {
    setIsOpen(true);
  };
  
  return (
    <div ref={containerRef} className={`jalali-calendar ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            id={id}
            name={name}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled}
            className={`calendar-input ${error ? 'error' : ''}`}
            autoComplete="off"
          />
          <button
            type="button"
            className="calendar-toggle"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <CalendarTodayIcon className="w-5 h-5" />
          </button>
          {selectedDate && (
            <button
              type="button"
              className="calendar-clear"
              onClick={handleClear}
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {isOpen && !disabled && (
          <div className="calendar-dropdown">
            <div className="calendar-view-switcher">
              <button
                type="button"
                className={`view-btn ${view === 'years' ? 'active' : ''}`}
                onClick={() => setView('years')}
              >
                {viewYear}
              </button>
              <button
                type="button"
                className={`view-btn ${view === 'months' ? 'active' : ''}`}
                onClick={() => setView('months')}
              >
                {getMonthNames()[viewMonth - 1]}
              </button>
            </div>
            
            {view === 'days' && renderDaysView()}
            {view === 'months' && renderMonthsView()}
            {view === 'years' && renderYearsView()}
            
            <div className="calendar-footer">
              <button
                type="button"
                className="today-btn"
                onClick={() => handleDateSelect(currentJalali.day)}
              >
                {locale === 'fa' ? 'امروز' : 'Today'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
      
      <style>{`
        .jalali-calendar {
          position: relative;
          width: 100%;
        }
        
        .calendar-input {
          width: 100%;
          padding: 10px 40px 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .calendar-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .calendar-input.error {
          border-color: #ef4444;
        }
        
        .calendar-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }
        
        .calendar-toggle,
        .calendar-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          padding: 4px;
          color: #6b7280;
          cursor: pointer;
          background: none;
          border: none;
        }
        
        .calendar-toggle:hover,
        .calendar-clear:hover {
          color: #374151;
        }
        
        .calendar-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          z-index: 50;
          overflow: hidden;
        }
        
        .calendar-view-switcher {
          display: flex;
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
          gap: 4px;
        }
        
        .view-btn {
          flex: 1;
          padding: 8px;
          text-align: center;
          background: none;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .view-btn:hover {
          background: #f3f4f6;
        }
        
        .view-btn.active {
          background: #3b82f6;
          color: white;
        }
        
        .calendar-grid {
          padding: 8px;
        }
        
        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px;
        }
        
        .calendar-nav-btn {
          padding: 4px 8px;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .calendar-nav-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }
        
        .calendar-header-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }
        
        .calendar-days-grid,
        .calendar-months-grid,
        .calendar-years-grid {
          display: grid;
          gap: 2px;
        }
        
        .calendar-days-grid {
          grid-template-columns: repeat(7, 1fr);
        }
        
        .calendar-months-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        
        .calendar-years-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        
        .calendar-day-header {
          padding: 8px;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
        }
        
        .calendar-day,
        .calendar-month,
        .calendar-year {
          padding: 8px;
          text-align: center;
          background: none;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .calendar-day:hover {
          background: #f3f4f6;
        }
        
        .calendar-day.selected {
          background: #3b82f6;
          color: white;
        }
        
        .calendar-day.today {
          font-weight: 600;
          color: #3b82f6;
        }
        
        .calendar-day.today.selected {
          color: white;
        }
        
        .calendar-month:hover,
        .calendar-year:hover {
          background: #f3f4f6;
        }
        
        .calendar-month.selected,
        .calendar-year.selected {
          background: #3b82f6;
          color: white;
        }
        
        .calendar-month.today,
        .calendar-year.today {
          font-weight: 600;
          color: #3b82f6;
        }
        
        .calendar-day-empty {
          padding: 8px;
        }
        
        .calendar-footer {
          padding: 8px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }
        
        .today-btn {
          padding: 6px 16px;
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .today-btn:hover {
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default JalaliCalendar;
