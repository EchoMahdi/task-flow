import axios from 'axios';
import { api } from './authService';

/**
 * Calendar Service
 * Handles fetching and managing tasks for calendar view
 */

const CALENDAR_CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get tasks for calendar view
 * @param {Object} params - Query parameters
 * @param {string} params.start_date - Start date (ISO format)
 * @param {string} params.end_date - End date (ISO format)
 * @param {string[]} params.status - Array of status values
 * @param {string[]} params.priority - Array of priority values
 * @param {boolean} params.include_completed - Include completed tasks
 * @returns {Promise<Object>} Tasks data with meta
 */
export const getCalendarTasks = async (params = {}) => {
  const { start_date, end_date, status, priority, include_completed } = params;
  
  // Build cache key
  const cacheKey = `calendar_${start_date}_${end_date}_${status?.join(',')}_${priority?.join(',')}_${include_completed}`;
  const cached = CALENDAR_CACHE.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const response = await api.get('/api/tasks/calendar', {
    params: {
      start_date,
      end_date,
      status,
      priority,
      include_completed,
    },
  });
  
  const data = response.data;
  
  // Cache the result
  CALENDAR_CACHE.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
  
  return data;
};

/**
 * Update task date (for drag & drop)
 * @param {number} taskId - Task ID
 * @param {Date|string} newDate - New due date
 * @returns {Promise<Object>} Updated task
 */
export const updateTaskDate = async (taskId, newDate) => {
  // Ensure date is in ISO format
  const dateObj = newDate instanceof Date ? newDate : new Date(newDate);
  const isoDate = dateObj.toISOString();
  
  const response = await api.patch(`/api/tasks/${taskId}/date`, {
    due_date: isoDate,
  });
  
  // Invalidate cache
  CALENDAR_CACHE.clear();
  
  return response.data;
};

/**
 * Get date range for calendar view
 * @param {string} view - Calendar view (month, week, day)
 * @param {Date} date - Reference date
 * @returns {Object} { start_date, end_date }
 */
export const getDateRange = (view, date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  let startDate, endDate;
  
  switch (view) {
    case 'day':
      startDate = new Date(year, month, day);
      endDate = new Date(year, month, day);
      break;
      
    case 'week':
      // Start from Sunday/Saturday based on preference
      const dayOfWeek = date.getDay();
      const firstDay = day - dayOfWeek;
      startDate = new Date(year, month, firstDay);
      endDate = new Date(year, month, firstDay + 6);
      break;
      
    case 'month':
    default:
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
      break;
  }
  
  return {
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
  };
};

/**
 * Navigate calendar
 * @param {string} view - Calendar view (month, week, day)
 * @param {Date} currentDate - Current date
 * @param {number} direction - Direction (-1 for previous, 1 for next)
 * @returns {Date} New date
 */
export const navigateCalendar = (view, currentDate, direction) => {
  const newDate = new Date(currentDate);
  
  switch (view) {
    case 'day':
      newDate.setDate(newDate.getDate() + direction);
      break;
      
    case 'week':
      newDate.setDate(newDate.getDate() + (direction * 7));
      break;
      
    case 'month':
      newDate.setMonth(newDate.getMonth() + direction);
      break;
      
    default:
      newDate.setMonth(newDate.getMonth() + direction);
  }
  
  return newDate;
};

/**
 * Jump to today
 * @returns {Date} Today's date
 */
export const jumpToToday = () => {
  return new Date();
};

/**
 * Group tasks by date
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Tasks grouped by due_date
 */
export const groupTasksByDate = (tasks) => {
  const grouped = {};
  
  tasks.forEach((task) => {
    const dateKey = task.due_date.split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(task);
  });
  
  return grouped;
};

/**
 * Clear calendar cache
 */
export const clearCalendarCache = () => {
  CALENDAR_CACHE.clear();
};

export default {
  getCalendarTasks,
  updateTaskDate,
  getDateRange,
  navigateCalendar,
  jumpToToday,
  groupTasksByDate,
  clearCalendarCache,
};
