import { useState, useEffect, useCallback, useMemo } from 'react';
import dateService from '../services/dateService';
import datePreferenceService from '../services/datePreferenceService';

/**
 * Hook for accessing and managing date formatting preferences
 */
export function useDateFormat() {
  const [preferences, setPreferences] = useState({
    calendarType: datePreferenceService.getCalendarType(),
    dateFormat: datePreferenceService.getDateFormat(),
    timeFormat: datePreferenceService.getTimeFormat(),
    firstDayOfWeek: datePreferenceService.getFirstDayOfWeek(),
    showWeekNumbers: datePreferenceService.getShowWeekNumbers(),
  });

  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  // Update preferences
  const updatePreferences = useCallback((newPrefs) => {
    const updated = { ...preferences, ...newPrefs };
    datePreferenceService.setDatePreferences(newPrefs);
    setPreferences(updated);
  }, [preferences]);

  // Set calendar type
  const setCalendarType = useCallback((type) => {
    updatePreferences({ calendarType: type });
  }, [updatePreferences]);

  // Set date format
  const setDateFormat = useCallback((format) => {
    updatePreferences({ dateFormat: format });
  }, [updatePreferences]);

  // Set time format
  const setTimeFormat = useCallback((format) => {
    updatePreferences({ timeFormat: format });
  }, [updatePreferences]);

  // Format a single date
  const formatDate = useCallback((date, options = {}) => {
    return datePreferenceService.formatDateByPreference(date, {
      ...options,
      locale,
      calendarType: options.calendarType || preferences.calendarType,
      dateFormat: options.dateFormat || preferences.dateFormat,
      timeFormat: options.timeFormat || preferences.timeFormat,
    });
  }, [locale, preferences]);

  // Format a date range
  const formatDateRange = useCallback((startDate, endDate, options = {}) => {
    return datePreferenceService.formatDateRange(startDate, endDate, {
      ...options,
      locale,
      calendarType: options.calendarType || preferences.calendarType,
      dateFormat: options.dateFormat || preferences.dateFormat,
    });
  }, [locale, preferences]);

  // Get relative time
  const getRelativeTime = useCallback((date) => {
    return dateService.getRelativeTime(date, preferences.calendarType, locale);
  }, [preferences.calendarType, locale]);

  // Convert to Jalali if needed
  const toJalali = useCallback((date) => {
    if (!date) return null;
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return dateService.gregorianToJalali(date);
  }, []);

  // Convert from Jalali to Gregorian
  const fromJalali = useCallback((jalaliDate) => {
    return dateService.jalaliToGregorian(jalaliDate);
  }, []);

  // Check if using Jalali calendar
  const isJalali = useMemo(() => {
    return preferences.calendarType === 'jalali';
  }, [preferences.calendarType]);

  // Get available format options
  const availableFormats = useMemo(() => {
    return {
      dateFormats: datePreferenceService.getAvailableDateFormats(preferences.calendarType, locale),
      timeFormats: datePreferenceService.getAvailableTimeFormats(),
      calendarTypes: datePreferenceService.getAvailableCalendarTypes(locale),
      firstDays: datePreferenceService.getAvailableFirstDays(locale),
    };
  }, [preferences.calendarType, locale]);

  return {
    preferences,
    locale,
    setLocale,
    updatePreferences,
    setCalendarType,
    setDateFormat,
    setTimeFormat,
    formatDate,
    formatDateRange,
    getRelativeTime,
    toJalali,
    fromJalali,
    isJalali,
    availableFormats,
  };
}

export default useDateFormat;
