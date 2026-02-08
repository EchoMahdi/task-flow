/**
 * Date Preference Service
 * 
 * Manages date-related user preferences and provides
 * formatting utilities based on user settings.
 * NOW syncs with backend via preferenceService.
 */

import { preferenceService } from './preferenceService';

// Default preferences
const defaults = {
  calendarType: 'gregorian', // 'gregorian' | 'jalali'
  dateFormat: 'YYYY/MM/DD',
  timeFormat: 'HH:mm',
  firstDayOfWeek: 'saturday', // 'sunday' | 'monday' | 'saturday'
  showWeekNumbers: false,
};

// Cache for date preferences loaded from backend
let cachedPreferences = null;
let cacheLoaded = false;

/**
 * Load date preferences from backend
 */
async function loadFromBackend() {
  if (cacheLoaded && cachedPreferences) return cachedPreferences;
  
  try {
    const prefs = await preferenceService.getPreferences();
    if (prefs) {
      cachedPreferences = {
        calendarType: prefs.calendar_type || defaults.calendarType,
        dateFormat: prefs.date_format || defaults.dateFormat,
        timeFormat: prefs.time_format || defaults.timeFormat,
        firstDayOfWeek: mapStartOfWeek(prefs.start_of_week),
        showWeekNumbers: prefs.show_week_numbers ?? defaults.showWeekNumbers,
      };
      cacheLoaded = true;
      return cachedPreferences;
    }
  } catch (error) {
    console.error('Failed to load date preferences from backend:', error);
  }
  
  return null;
}

/**
 * Map backend start_of_week (0=Sunday, 1=Monday, 6=Saturday) to frontend string
 */
function mapStartOfWeek(value) {
  if (value === undefined || value === null) return defaults.firstDayOfWeek;
  if (value === 0) return 'sunday';
  if (value === 6) return 'saturday';
  return 'monday';
}

/**
 * Map frontend startOfWeek string to backend integer
 */
export function mapStartOfWeekToBackend(value) {
  if (value === 'sunday') return 0;
  if (value === 'saturday') return 6;
  return 1;
}

/**
 * Map backend date format to frontend format
 */
function mapBackendDateFormat(backendFormat) {
  const mapping = {
    'Y-m-d': 'YYYY-MM-DD',
    'm/d/Y': 'MM/DD/YYYY',
    'd/m/Y': 'DD/MM/YYYY',
    'd.m.Y': 'DD.MM.YYYY',
  };
  return mapping[backendFormat] || 'YYYY-MM-DD';
}

/**
 * Map frontend date format to backend format
 */
export function mapDateFormatToBackend(frontendValue) {
  const mapping = {
    'YYYY-MM-DD': 'Y-m-d',
    'MM/DD/YYYY': 'm/d/Y',
    'DD/MM/YYYY': 'd/m/Y',
    'DD.MM.YYYY': 'd.m.Y',
  };
  return mapping[frontendValue] || 'Y-m-d';
}

/**
 * Map backend time format to frontend format
 */
function mapBackendTimeFormat(backendFormat) {
  const mapping = {
    'H:i': 'HH:mm',
    'h:i A': 'h:mm A',
  };
  return mapping[backendFormat] || 'HH:mm';
}

/**
 * Map frontend time format to backend format
 */
export function mapTimeFormatToBackend(frontendValue) {
  const mapping = {
    'HH:mm': 'H:i',
    'h:mm A': 'h:i A',
    'HH:mm:ss': 'H:i:s',
    'h:mm:ss A': 'h:i:s A',
  };
  return mapping[frontendValue] || 'H:i';
}

/**
 * Get calendar type preference - synced with backend
 */
export async function getCalendarType() {
  const backendPrefs = await loadFromBackend();
  if (backendPrefs) return backendPrefs.calendarType;
  
  // Fallback to localStorage
  if (typeof window === 'undefined') return defaults.calendarType;
  
  const stored = localStorage.getItem('date_calendar_type');
  if (stored) return stored;
  
  // Default to jalali for Persian locale
  const language = localStorage.getItem('app_language') || 'en';
  return language === 'fa' ? 'jalali' : defaults.calendarType;
}

/**
 * Set calendar type preference - syncs with backend
 */
export async function setCalendarType(type) {
  // Update localStorage for immediate access
  if (typeof window !== 'undefined') {
    localStorage.setItem('date_calendar_type', type);
  }
  
  // Sync with backend
  try {
    await preferenceService.updatePreferences({ calendar_type: type });
  } catch (error) {
    console.error('Failed to sync calendar_type to backend:', error);
  }
}

/**
 * Get date format preference - synced with backend
 */
export async function getDateFormat() {
  const backendPrefs = await loadFromBackend();
  if (backendPrefs) return mapBackendDateFormat(backendPrefs.dateFormat);
  
  // Fallback to localStorage
  if (typeof window === 'undefined') return defaults.dateFormat;
  
  const stored = localStorage.getItem('date_format');
  if (stored) return stored;
  
  // Default to Jalali format for Persian
  const language = localStorage.getItem('app_language') || 'en';
  return language === 'fa' ? 'YYYY/MM/DD' : defaults.dateFormat;
}

/**
 * Set date format preference - syncs with backend
 */
export async function setDateFormat(format) {
  const backendFormat = mapDateFormatToBackend(format);
  
  // Update localStorage for immediate access
  if (typeof window !== 'undefined') {
    localStorage.setItem('date_format', format);
  }
  
  // Sync with backend
  try {
    await preferenceService.updatePreferences({ date_format: backendFormat });
  } catch (error) {
    console.error('Failed to sync date_format to backend:', error);
  }
}

/**
 * Get time format preference - synced with backend
 */
export async function getTimeFormat() {
  const backendPrefs = await loadFromBackend();
  if (backendPrefs) return mapBackendTimeFormat(backendPrefs.timeFormat);
  
  // Fallback to localStorage
  if (typeof window === 'undefined') return defaults.timeFormat;
  
  const stored = localStorage.getItem('time_format');
  if (stored) return stored;
  
  return defaults.timeFormat;
}

/**
 * Set time format preference - syncs with backend
 */
export async function setTimeFormat(format) {
  const backendFormat = mapTimeFormatToBackend(format);
  
  // Update localStorage for immediate access
  if (typeof window !== 'undefined') {
    localStorage.setItem('time_format', format);
  }
  
  // Sync with backend
  try {
    await preferenceService.updatePreferences({ time_format: backendFormat });
  } catch (error) {
    console.error('Failed to sync time_format to backend:', error);
  }
}

/**
 * Get first day of week preference - synced with backend
 */
export async function getFirstDayOfWeek() {
  const backendPrefs = await loadFromBackend();
  if (backendPrefs) return backendPrefs.firstDayOfWeek;
  
  // Fallback to localStorage
  if (typeof window === 'undefined') return defaults.firstDayOfWeek;
  
  const stored = localStorage.getItem('date_first_day_of_week');
  if (stored) return stored;
  
  // Default to Saturday for Jalali calendar
  const calendarType = await getCalendarType();
  return calendarType === 'jalali' ? 'saturday' : defaults.firstDayOfWeek;
}

/**
 * Set first day of week preference - syncs with backend
 */
export async function setFirstDayOfWeek(day) {
  const backendValue = mapStartOfWeekToBackend(day);
  
  // Update localStorage for immediate access
  if (typeof window !== 'undefined') {
    localStorage.setItem('date_first_day_of_week', day);
  }
  
  // Sync with backend
  try {
    await preferenceService.updatePreferences({ start_of_week: backendValue });
  } catch (error) {
    console.error('Failed to sync start_of_week to backend:', error);
  }
}

/**
 * Get show week numbers preference - synced with backend
 */
export async function getShowWeekNumbers() {
  const backendPrefs = await loadFromBackend();
  if (backendPrefs) return backendPrefs.showWeekNumbers;
  
  // Fallback to localStorage
  if (typeof window === 'undefined') return defaults.showWeekNumbers;
  
  const stored = localStorage.getItem('date_show_week_numbers');
  return stored === 'true';
}

/**
 * Set show week numbers preference - syncs with backend
 */
export async function setShowWeekNumbers(show) {
  // Update localStorage for immediate access
  if (typeof window !== 'undefined') {
    localStorage.setItem('date_show_week_numbers', String(show));
  }
  
  // Sync with backend
  try {
    await preferenceService.updatePreferences({ show_week_numbers: show });
  } catch (error) {
    console.error('Failed to sync show_week_numbers to backend:', error);
  }
}

/**
 * Get all date preferences - synced with backend
 */
export async function getDatePreferences() {
  const backendPrefs = await loadFromBackend();
  if (backendPrefs) {
    return backendPrefs;
  }
  
  // Fallback to localStorage
  return {
    calendarType: await getCalendarType(),
    dateFormat: await getDateFormat(),
    timeFormat: await getTimeFormat(),
    firstDayOfWeek: await getFirstDayOfWeek(),
    showWeekNumbers: await getShowWeekNumbers(),
  };
}

/**
 * Set all date preferences at once - syncs with backend
 */
export async function setDatePreferences(prefs) {
  const payload = {};
  
  if (prefs.calendarType !== undefined) {
    payload.calendar_type = prefs.calendarType;
  }
  if (prefs.dateFormat !== undefined) {
    payload.date_format = mapDateFormatToBackend(prefs.dateFormat);
  }
  if (prefs.timeFormat !== undefined) {
    payload.time_format = mapTimeFormatToBackend(prefs.timeFormat);
  }
  if (prefs.firstDayOfWeek !== undefined) {
    payload.start_of_week = mapStartOfWeekToBackend(prefs.firstDayOfWeek);
  }
  if (prefs.showWeekNumbers !== undefined) {
    payload.show_week_numbers = prefs.showWeekNumbers;
  }
  
  // Update localStorage for immediate access
  if (typeof window !== 'undefined') {
    if (prefs.calendarType) localStorage.setItem('date_calendar_type', prefs.calendarType);
    if (prefs.dateFormat) localStorage.setItem('date_format', prefs.dateFormat);
    if (prefs.timeFormat) localStorage.setItem('time_format', prefs.timeFormat);
    if (prefs.firstDayOfWeek) localStorage.setItem('date_first_day_of_week', prefs.firstDayOfWeek);
    if (prefs.showWeekNumbers !== undefined) {
      localStorage.setItem('date_show_week_numbers', String(prefs.showWeekNumbers));
    }
  }
  
  // Sync with backend
  if (Object.keys(payload).length > 0) {
    try {
      await preferenceService.updatePreferences(payload);
      cacheLoaded = false; // Reset cache
    } catch (error) {
      console.error('Failed to sync date preferences to backend:', error);
    }
  }
}

/**
 * Format a date according to user preferences
 */
export async function formatDateByPreference(date, options = {}) {
  const calendarType = await getCalendarType();
  const dateFormat = await getDateFormat();
  const timeFormat = await getTimeFormat();
  const locale = options.locale || localStorage.getItem('app_language') || 'en';
  const includeTime = options.includeTime !== false;
  
  let formatted = dateService.formatDate(date, dateFormat, calendarType, locale);
  
  if (includeTime) {
    formatted += ` ${dateService.formatDate(date, timeFormat, calendarType, locale)}`;
  }
  
  return formatted;
}

/**
 * Format a date range according to user preferences
 */
export async function formatDateRange(startDate, endDate, options = {}) {
  const calendarType = await getCalendarType();
  const dateFormat = await getDateFormat();
  const locale = options.locale || localStorage.getItem('app_language') || 'en';
  
  const startFormatted = dateService.formatDate(startDate, dateFormat, calendarType, locale);
  const endFormatted = dateService.formatDate(endDate, dateFormat, calendarType, locale);
  
  if (locale === 'fa') {
    return `${startFormatted} تا ${endFormatted}`;
  }
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Get available date formats
 */
export function getAvailableDateFormats(calendarType = 'gregorian', locale = 'en') {
  if (calendarType === 'jalali') {
    return [
      { value: 'YYYY/MM/DD', label: locale === 'fa' ? '1402/01/01' : '2023/01/01' },
      { value: 'YYYY-MM-DD', label: locale === 'fa' ? '1402-01-01' : '2023-01-01' },
      { value: 'D MMMM YYYY', label: locale === 'fa' ? '1 فروردین 1402' : '1 January 2023' },
      { value: 'MMMM D, YYYY', label: locale === 'fa' ? 'فروردین 1, 1402' : 'January 1, 2023' },
      { value: 'DD MMMM YYYY', label: locale === 'fa' ? '1 فروردین 1402' : '1 January 2023' },
    ];
  }
  
  return [
    { value: 'YYYY/MM/DD', label: '2023/01/01' },
    { value: 'YYYY-MM-DD', label: '2023-01-01' },
    { value: 'MM/DD/YYYY', label: '01/01/2023' },
    { value: 'DD/MM/YYYY', label: '01/01/2023' },
    { value: 'D MMMM YYYY', label: '1 January 2023' },
    { value: 'MMMM D, YYYY', label: 'January 1, 2023' },
    { value: 'DD MMMM YYYY', label: '1 January 2023' },
  ];
}

/**
 * Get available time formats
 */
export function getAvailableTimeFormats() {
  return [
    { value: 'HH:mm', label: '14:30' },
    { value: 'HH:mm:ss', label: '14:30:45' },
    { value: 'h:mm A', label: '2:30 PM' },
    { value: 'h:mm:ss A', label: '2:30:45 PM' },
  ];
}

/**
 * Get available calendar types
 */
export function getAvailableCalendarTypes(locale = 'en') {
  return [
    { value: 'gregorian', label: locale === 'fa' ? 'میلادی (Gregorian)' : 'Gregorian' },
    { value: 'jalali', label: locale === 'fa' ? 'شمسی (Jalali)' : 'Jalali (Shamsi)' },
  ];
}

/**
 * Get available first day of week options
 */
export function getAvailableFirstDays(locale = 'en') {
  return [
    { value: 'saturday', label: locale === 'fa' ? 'شنبه' : 'Saturday' },
    { value: 'sunday', label: locale === 'fa' ? 'یکشنبه' : 'Sunday' },
    { value: 'monday', label: locale === 'fa' ? 'دوشنبه' : 'Monday' },
  ];
}

/**
 * Check if Jalali calendar should be used based on locale and user preference
 */
export async function shouldUseJalali() {
  const calendarType = await getCalendarType();
  const language = localStorage.getItem('app_language') || 'en';
  
  // If explicitly set to jalali, use it
  if (calendarType === 'jalali') return true;
  
  // Default to jalali for Persian language
  if (language === 'fa' && calendarType !== 'gregorian') return true;
  
  return false;
}

/**
 * Convert a date for API submission
 * Always converts to Gregorian for storage
 */
export async function convertDateForApi(dateValue, options = {}) {
  if (!dateValue) return null;
  
  // If already a Date object, return as-is
  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }
  
  // If string, parse it
  if (typeof dateValue === 'string') {
    // Check if it's already in ISO format
    if (dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
      return dateValue;
    }
    
    // Parse as the user's calendar type
    const calendarType = options.calendarType || await getCalendarType();
    const parsed = dateService.parseDate(dateValue, calendarType);
    
    if (parsed) {
      return parsed.toISOString();
    }
  }
  
  return null;
}

/**
 * Parse API date response
 * Returns a Date object
 */
export async function parseApiDate(dateString) {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Refresh cached preferences from backend
 */
export function refreshCache() {
  cacheLoaded = false;
  cachedPreferences = null;
}

export default {
  getCalendarType,
  setCalendarType,
  getDateFormat,
  setDateFormat,
  getTimeFormat,
  setTimeFormat,
  getFirstDayOfWeek,
  setFirstDayOfWeek,
  getDatePreferences,
  setDatePreferences,
  formatDateByPreference,
  formatDateRange,
  getAvailableDateFormats,
  getAvailableTimeFormats,
  getAvailableCalendarTypes,
  getAvailableFirstDays,
  shouldUseJalali,
  convertDateForApi,
  parseApiDate,
  refreshCache,
  mapStartOfWeekToBackend,
  mapDateFormatToBackend,
  mapTimeFormatToBackend,
};
