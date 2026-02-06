/**
 * Jalali (Shamsi) Date Service
 * 
 * Pure JavaScript implementation of Jalali calendar conversion.
 * All dates are stored in Gregorian format, conversion happens only for display.
 */

import { toPersianNumerals } from '../utils/persianNumerals';

const JALALI_EPOCH = 1948321; // Julian day for 622-03-19 (Islamic New Year)
const GREGORIAN_EPOCH = 1721426; // Julian day for 1-01-01 (Gregorian)

/**
 * Break down a date object into year, month, day components
 */
function getDateParts(date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    dayOfWeek: date.getDay(),
    timestamp: date.getTime()
  };
}

/**
 * Check if a year is a leap year in Gregorian calendar
 */
function isGregorianLeap(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Check if a year is a leap year in Jalali calendar
 * Jalali leap years follow a 33-year cycle approximately
 */
function isJalaliLeap(year) {
  // The 33-year cycle approximation
  const cycle = year - 474;
  const yearInCycle = cycle % 2820;
  const leaps = (cycle - yearInCycle + 474) * 682;
  const fixed = (yearInCycle * 682 - 467) % 2820;
  return fixed > 0 ? 1 : 0;
}

/**
 * Days in each month for Jalali calendar
 */
function getJalaliMonthDays(year, month) {
  const days = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  if (month === 12 && isJalaliLeap(year)) {
    days[11] = 30;
  }
  return days[month - 1];
}

/**
 * Days in each month for Gregorian calendar
 */
function getGregorianMonthDays(year, month) {
  const days = [31, isGregorianLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month - 1];
}

/**
 * Convert Gregorian date to Jalali
 * Returns { year, month, day }
 */
export function gregorianToJalali(gregorianDate) {
  const parts = getDateParts(gregorianDate);
  
  // Calculate days since a reference date
  const gYear = parts.year;
  const gMonth = parts.month;
  const gDay = parts.day;
  
  // Calculate Julian Day Number
  let jdn = GREGORIAN_EPOCH - 1;
  
  // Add days for years
  for (let y = 1; y < gYear; y++) {
    jdn += isGregorianLeap(y) ? 366 : 365;
  }
  
  // Add days for months
  for (let m = 1; m < gMonth; m++) {
    jdn += getGregorianMonthDays(gYear, m);
  }
  
  // Add days
  jdn += gDay;
  
  // Convert to Jalali
  return jdnToJalali(jdn);
}

/**
 * Convert Julian Day Number to Jalali date
 */
function jdnToJalali(jdn) {
  // Algorithm from "Calendrical Calculations"
  const jYear = jdn - JALALI_EPOCH;
  const centuries = Math.floor((4 * jYear + 3) / 146097);
  let days = jYear - Math.floor((146097 * centuries) / 4);
  const years = Math.floor((4 * days + 3) / 1461);
  days = days - Math.floor((1461 * years) / 4) + 1;
  const months = Math.floor((5 * days - 3) / 153);
  const jDay = days - Math.floor((153 * months + 2) / 5) + 1;
  const jMonth = months + 3 - 12 * Math.floor(months / 12);
  const jYearY = years + centuries * 100 - 574;
  
  return {
    year: jYearY,
    month: jMonth,
    day: jDay
  };
}

/**
 * Convert Jalali date to Gregorian
 * Input can be object {year, month, day} or Date object
 */
export function jalaliToGregorian(jalaliDate) {
  let jYear, jMonth, jDay;
  
  if (jalaliDate instanceof Date) {
    const parts = gregorianToJalali(jalaliDate);
    jYear = parts.year;
    jMonth = parts.month;
    jDay = parts.day;
  } else {
    jYear = jalaliDate.year;
    jMonth = jalaliDate.month;
    jDay = jalaliDate.day;
  }
  
  // Calculate Julian Day Number
  const jYearAdjusted = jYear + 1597;
  const days = 684 * Math.floor((jYear + 1597) / 2820) + Math.floor((jMonth + 2) / 12) * 366 +
               Math.floor((31 * jMonth) / 12) - 80 + jDay + JALALI_EPOCH - 1;
  
  // Convert JDN to Gregorian
  return jdnToGregorian(Math.floor(days));
}

/**
 * Convert Julian Day Number to Gregorian date
 */
function jdnToGregorian(jdn) {
  const f = jdn + 1401 + (((4 * jdn + 274277) / 146097) * 3) / 4 - 38;
  const e = 4 * f + 3;
  const g = (e % 1461) / 4;
  const h = 5 * g + 2;
  const day = (h % 153) / 5 + 1;
  const month = Math.floor(h / 153) + 3;
  const year = Math.floor(e / 1461) - 4716 + Math.floor((14 - month) / 12);
  
  return new Date(year, month - 1, day);
}

/**
 * Format a date according to the specified format and calendar
 */
export function formatDate(date, format = 'YYYY/MM/DD', calendar = 'gregorian', locale = 'en') {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  if (calendar === 'jalali') {
    const jDate = gregorianToJalali(date);
    const monthNames = getMonthNames(locale, 'jalali');
    const dayNames = getDayNames(locale);
    
    const replacements = {
      'YYYY': String(jDate.year).padStart(4, '0'),
      'YY': String(jDate.year).slice(-2),
      'MMMM': monthNames[jDate.month - 1],
      'MMM': monthNames[jDate.month - 1].slice(0, 3),
      'MM': String(jDate.month).padStart(2, '0'),
      'M': jDate.month,
      'DDDD': dayNames[date.getDay()],
      'DDD': dayNames[date.getDay()].slice(0, 3),
      'DD': String(jDate.day).padStart(2, '0'),
      'D': jDate.day,
      'HH': String(date.getHours()).padStart(2, '0'),
      'H': date.getHours(),
      'mm': String(date.getMinutes()).padStart(2, '0'),
      'm': date.getMinutes(),
      'ss': String(date.getSeconds()).padStart(2, '0'),
      's': date.getSeconds(),
    };
    
    let formatted = format;
    Object.entries(replacements).forEach(([key, value]) => {
      formatted = formatted.replace(new RegExp(key, 'g'), value);
    });
    
    // Convert numerals to Persian for Persian locale
    if (locale === 'fa') {
      formatted = toPersianNumerals(formatted);
    }
    
    return formatted;
  } else {
    // Gregorian
    const monthNames = getMonthNames(locale, 'gregorian');
    const dayNames = getDayNames(locale);
    
    const replacements = {
      'YYYY': date.getFullYear(),
      'YY': String(date.getFullYear()).slice(-2),
      'MMMM': monthNames[date.getMonth()],
      'MMM': monthNames[date.getMonth()].slice(0, 3),
      'MM': String(date.getMonth() + 1).padStart(2, '0'),
      'M': date.getMonth() + 1,
      'DDDD': dayNames[date.getDay()],
      'DDD': dayNames[date.getDay()].slice(0, 3),
      'DD': String(date.getDate()).padStart(2, '0'),
      'D': date.getDate(),
      'HH': String(date.getHours()).padStart(2, '0'),
      'H': date.getHours(),
      'mm': String(date.getMinutes()).padStart(2, '0'),
      'm': date.getMinutes(),
      'ss': String(date.getSeconds()).padStart(2, '0'),
      's': date.getSeconds(),
    };
    
    let formatted = format;
    Object.entries(replacements).forEach(([key, value]) => {
      formatted = formatted.replace(new RegExp(key, 'g'), value);
    });
    
    // Convert numerals to Persian for Persian locale
    if (locale === 'fa') {
      formatted = toPersianNumerals(formatted);
    }
    
    return formatted;
  }
}

/**
 * Get month names for the specified calendar and locale
 */
function getMonthNames(locale, calendar) {
  if (calendar === 'jalali') {
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
  } else {
    if (locale === 'fa') {
      return [
        'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
        'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
      ];
    }
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  }
}

/**
 * Get day names for the specified locale
 */
function getDayNames(locale) {
  if (locale === 'fa') {
    return ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  }
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
}

/**
 * Parse a date string and return a Date object
 * Supports both Gregorian and Jalali formats
 */
export function parseDate(dateString, calendar = 'gregorian') {
  if (!dateString) return null;
  
  // Try parsing as standard ISO date first
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try parsing Jalali format (YYYY/MM/DD or YYYY-MM-DD)
  const jalaliRegex = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
  const match = dateString.match(jalaliRegex);
  
  if (match && calendar === 'jalali') {
    return jalaliToGregorian({
      year: parseInt(match[1]),
      month: parseInt(match[2]),
      day: parseInt(match[3])
    });
  }
  
  // Try parsing Gregorian format
  const gregorianRegex = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
  const gMatch = dateString.match(gregorianRegex);
  
  if (gMatch) {
    return new Date(parseInt(gMatch[1]), parseInt(gMatch[2]) - 1, parseInt(gMatch[3]));
  }
  
  return null;
}

/**
 * Get relative time string (e.g., "2 days ago", "Yesterday")
 */
export function getRelativeTime(date, calendar = 'gregorian', locale = 'en') {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (locale === 'fa') {
    if (diffSec < 60) return 'همین لحظه';
    if (diffMin < 60) return `${toPersianNumerals(diffMin)} دقیقه پیش`;
    if (diffHour < 24) return `${toPersianNumerals(diffHour)} ساعت پیش`;
    if (diffDay === 1) return 'دیروز';
    if (diffDay < 7) return `${toPersianNumerals(diffDay)} روز پیش`;
    return formatDate(date, 'YYYY/MM/DD', calendar, locale);
  } else {
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay} days ago`;
    return formatDate(date, 'YYYY/MM/DD', calendar, locale);
  }
}

/**
 * Get Jalali year months for calendar display
 */
export function getJalaliYearMonths(year) {
  return Array.from({ length: 12 }, (_, i) => {
    return {
      number: i + 1,
      days: getJalaliMonthDays(year, i + 1)
    };
  });
}

/**
 * Create a Jalali date object from components
 */
export function createJalaliDate(year, month, day) {
  const gregorianDate = jalaliToGregorian({ year, month, day });
  return gregorianDate;
}

/**
 * Get today's date in Jalali format
 */
export function getTodayJalali() {
  return gregorianToJalali(new Date());
}

/**
 * Validate a Jalali date
 */
export function isValidJalaliDate(year, month, day) {
  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }
  const maxDay = getJalaliMonthDays(year, month);
  return day <= maxDay;
}

/**
 * Get the number of days in a Jalali month
 */
export function getJalaliMonthLength(year, month) {
  return getJalaliMonthDays(year, month);
}

export default {
  gregorianToJalali,
  jalaliToGregorian,
  formatDate,
  parseDate,
  getRelativeTime,
  getJalaliYearMonths,
  createJalaliDate,
  getTodayJalali,
  isValidJalaliDate,
  getJalaliMonthLength,
  isJalaliLeap
};
