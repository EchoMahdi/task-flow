/**
 * Persian (Farsi) Numerals Utility
 * 
 * Provides functions to convert between Arabic/Western numerals
 * and Persian (Farsi) numerals for proper display in Persian locale.
 */

// Persian numeral characters
const PERSIAN_NUMERALS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

// Arabic numeral characters (for reference)
const ARABIC_NUMERALS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Convert Western/Arabic numerals to Persian numerals
 * @param {string|number} input - The input string or number to convert
 * @returns {string} String with Persian numerals
 */
export function toPersianNumerals(input) {
  if (input === null || input === undefined) {
    return '';
  }

  const str = String(input);
  let result = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = char.charCodeAt(0);

    // Check if it's a Western digit (0-9)
    if (code >= 48 && code <= 57) {
      result += PERSIAN_NUMERALS[code - 48];
    }
    // Check if it's an Arabic digit (٠-٩)
    else if (code >= 1632 && code <= 1641) {
      result += PERSIAN_NUMERALS[code - 1632];
    }
    else {
      result += char;
    }
  }

  return result;
}

/**
 * Convert Persian numerals to Western numerals
 * @param {string} input - The input string with Persian numerals
 * @returns {string} String with Western numerals
 */
export function fromPersianNumerals(input) {
  if (input === null || input === undefined) {
    return '';
  }

  const str = String(input);
  let result = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = char.charCodeAt(0);

    // Check if it's a Persian digit (۰-۹)
    if (code >= 1776 && code <= 1785) {
      result += String(code - 1776);
    }
    // Check if it's an Arabic digit (٠-٩)
    else if (code >= 1632 && code <= 1641) {
      result += String(code - 1632);
    }
    else {
      result += char;
    }
  }

  return result;
}

/**
 * Check if a string contains Persian numerals
 * @param {string} input - The input string to check
 * @returns {boolean} True if the string contains Persian numerals
 */
export function hasPersianNumerals(input) {
  if (!input) return false;
  const str = String(input);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 1776 && code <= 1785) {
      return true;
    }
  }
  return false;
}

/**
 * Format a number with Persian numerals and optional thousands separator
 * @param {number} num - The number to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.useSeparator - Whether to use thousands separator (default: true)
 * @param {string} options.separator - The separator character (default: ',')
 * @returns {string} Formatted number with Persian numerals
 */
export function formatPersianNumber(num, options = {}) {
  const { useSeparator = true, separator = ',' } = options;

  if (num === null || num === undefined) {
    return '';
  }

  // Format with thousands separator if requested
  let formatted = useSeparator 
    ? num.toLocaleString('en-US')
    : String(num);

  // Convert to Persian numerals
  return toPersianNumerals(formatted);
}

/**
 * Parse a Persian number string to a JavaScript number
 * @param {string} str - The string with Persian numerals
 * @returns {number} The parsed number
 */
export function parsePersianNumber(str) {
  if (!str) return 0;
  const western = fromPersianNumerals(str);
  const parsed = parseFloat(western.replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Get Persian ordinal suffix (e.g., 'ام' for 'th')
 * @param {number} num - The number
 * @returns {string} The Persian ordinal suffix
 */
export function getPersianOrdinal(num) {
  if (num === null || num === undefined) return '';
  
  const lastDigit = Math.abs(num) % 10;
  const lastTwoDigits = Math.abs(num) % 100;

  // Special cases for 11, 12, 13
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'ام';
  }

  switch (lastDigit) {
    case 1:
      return 'م';
    case 2:
      return 'م';
    case 3:
      return 'م';
    default:
      return 'ام';
  }
}

/**
 * Format a date string with Persian numerals
 * This is a convenience function that combines date formatting with numeral conversion
 * @param {string} dateStr - The date string to format
 * @returns {string} Date string with Persian numerals
 */
export function formatPersianDate(dateStr) {
  if (!dateStr) return '';
  return toPersianNumerals(dateStr);
}

/**
 * Convert time to Persian format with Persian numerals
 * @param {string} timeStr - Time string (e.g., "14:30")
 * @param {boolean} use12Hour - Whether to use 12-hour format
 * @returns {string} Time string with Persian numerals
 */
export function formatPersianTime(timeStr, use12Hour = false) {
  if (!timeStr) return '';

  let result = toPersianNumerals(timeStr);

  if (use12Hour) {
    // Convert 24-hour to 12-hour format with Persian AM/PM
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'ب.ظ' : 'ق.ظ';
    const displayHours = hours % 12 || 12;
    result = `${toPersianNumerals(displayHours.toString().padStart(2, '0'))}:${toPersianNumerals(minutes.toString().padStart(2, '0'))} ${period}`;
  }

  return result;
}

/**
 * Get Persian month name with optional Persian numeral
 * @param {number} month - Month number (1-12)
 * @param {boolean} usePersianNumerals - Whether to use Persian numerals for the month number
 * @returns {string} Persian month name
 */
export function getPersianMonthName(month, usePersianNumerals = false) {
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  if (month < 1 || month > 12) {
    return '';
  }

  const monthName = persianMonths[month - 1];
  return usePersianNumerals ? `${toPersianNumerals(month)} ${monthName}` : monthName;
}

/**
 * Get Persian day name
 * @param {number} day - Day of week (0-6, where 0 is Saturday in Persian calendar)
 * @returns {string} Persian day name
 */
export function getPersianDayName(day) {
  const persianDays = [
    'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
  ];

  if (day < 0 || day > 6) {
    return '';
  }

  return persianDays[day];
}

/**
 * Get Persian day name (short)
 * @param {number} day - Day of week (0-6, where 0 is Saturday in Persian calendar)
 * @returns {string} Short Persian day name
 */
export function getPersianDayNameShort(day) {
  const persianDaysShort = [
    'ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'
  ];

  if (day < 0 || day > 6) {
    return '';
  }

  return persianDaysShort[day];
}

export default {
  toPersianNumerals,
  fromPersianNumerals,
  hasPersianNumerals,
  formatPersianNumber,
  parsePersianNumber,
  getPersianOrdinal,
  formatPersianDate,
  formatPersianTime,
  getPersianMonthName,
  getPersianDayName,
  getPersianDayNameShort,
};
