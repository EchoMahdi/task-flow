import React, { useMemo } from 'react';
import dateService from '../../services/dateService';
import datePreferenceService from '../../services/datePreferenceService';

/**
 * DateDisplay Component
 * 
 * Displays dates according to user preferences (Gregorian or Jalali).
 * All dates are stored in standard format, conversion happens at display time.
 */
const DateDisplay = ({
  date,
  format,
  calendar,
  locale,
  variant = 'default', // 'default' | 'compact' | 'relative' | 'full'
  showTime = false,
  showIcon = false,
  className = '',
  title,
  as = 'span', // 'span' | 'div' | 'time'
}) => {
  // Parse date
  const parsedDate = useMemo(() => {
    if (!date) return null;
    
    if (date instanceof Date) {
      return date;
    }
    
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }, [date]);
  
  // Get display preferences
  const displayCalendar = calendar || datePreferenceService.getCalendarType();
  const displayLocale = locale || localStorage.getItem('app_language') || 'en';
  const displayFormat = format || datePreferenceService.getDateFormat();
  
  // Format options based on variant
  const formatOptions = useMemo(() => {
    switch (variant) {
      case 'compact':
        return 'YYYY/MM/DD';
      case 'full':
        return showTime ? 'DDDD, MMMM D, YYYY HH:mm' : 'DDDD, MMMM D, YYYY';
      case 'relative':
        return null;
      default:
        return displayFormat;
    }
  }, [variant, displayFormat, showTime]);
  
  // Format date or get relative time
  const formattedDate = useMemo(() => {
    if (!parsedDate) return '';
    
    if (variant === 'relative') {
      return dateService.getRelativeTime(parsedDate, displayCalendar, displayLocale);
    }
    
    const timeFormat = showTime ? datePreferenceService.getTimeFormat() : null;
    return dateService.formatDate(
      parsedDate,
      formatOptions,
      displayCalendar,
      displayLocale,
      timeFormat
    );
  }, [parsedDate, variant, formatOptions, displayCalendar, displayLocale, showTime]);
  
  // Get title attribute (full ISO date for accessibility)
  const titleText = title || (parsedDate ? parsedDate.toISOString() : '');
  
  // Render as specified element
  const Component = as;
  
  if (!parsedDate) {
    return (
      <Component className={`date-display date-display-empty ${className}`}>
        —
      </Component>
    );
  }
  
  return (
    <Component
      className={`date-display date-display-${variant} ${displayCalendar === 'jalali' ? 'date-display-jalali' : ''} ${className}`}
      title={titleText}
      dateTime={parsedDate.toISOString()}
    >
      {showIcon && (
        <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )}
      {formattedDate}
    </Component>
  );
};

/**
 * DateRange Component
 * Displays a date range according to user preferences
 */
export const DateRange = ({
  startDate,
  endDate,
  separator = ' – ',
  calendar,
  locale,
  className = '',
}) => {
  return (
    <span className={`date-range ${className}`}>
      <DateDisplay
        date={startDate}
        calendar={calendar}
        locale={locale}
        variant="compact"
      />
      {separator}
      <DateDisplay
        date={endDate}
        calendar={calendar}
        locale={locale}
        variant="compact"
      />
    </span>
  );
};

/**
 * RelativeDate Component
 * Displays a relative time (e.g., "2 hours ago")
 */
export const RelativeDate = ({
  date,
  calendar,
  locale,
  className = '',
}) => {
  return (
    <DateDisplay
      date={date}
      calendar={calendar}
      locale={locale}
      variant="relative"
      className={className}
    />
  );
};

export default DateDisplay;
