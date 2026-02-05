import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import calendarService from '../../services/calendarService';
import dateService from '../../services/dateService';
import { Icons } from '../ui/Icons';
import CalendarTaskItem from './CalendarTaskItem';
import CalendarFilters from './CalendarFilters';

/**
 * TaskCalendar Component
 * 
 * A full-featured calendar view for tasks with:
 * - Day/Week/Month views
 * - Drag & drop task rescheduling
 * - Task filtering
 * - Shamsi/Gregorian support
 */
const TaskCalendar = ({
  onTaskClick,
  onTaskEdit,
  onCreateTask,
  defaultView = 'month',
}) => {
  const { t } = useTranslation();
  const { formatDate, isJalali, preferences, availableFormats } = useDateFormat();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(defaultView);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    include_completed: false,
  });
  const [draggedTask, setDraggedTask] = useState(null);
  const [dropTargetDate, setDropTargetDate] = useState(null);
  
  // Fetch tasks for current view
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { start_date, end_date } = calendarService.getDateRange(view, currentDate);
      
      const result = await calendarService.getCalendarTasks({
        start_date,
        end_date,
        status: filters.status,
        priority: filters.priority,
        include_completed: filters.include_completed,
      });
      
      setTasks(result.data || []);
    } catch (err) {
      console.error('Failed to fetch calendar tasks:', err);
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  }, [view, currentDate, filters, t]);
  
  // Refetch when dependencies change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  // Group tasks by date
  const tasksByDate = useMemo(() => {
    return calendarService.groupTasksByDate(tasks);
  }, [tasks]);
  
  // Navigation handlers
  const handlePrevious = () => {
    setCurrentDate(calendarService.navigateCalendar(view, currentDate, -1));
  };
  
  const handleNext = () => {
    setCurrentDate(calendarService.navigateCalendar(view, currentDate, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(calendarService.jumpToToday());
  };
  
  // Drag & drop handlers
  const handleDragStart = (task, e) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id.toString());
  };
  
  const handleDragOver = (date, e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetDate(date);
  };
  
  const handleDragLeave = () => {
    setDropTargetDate(null);
  };
  
  const handleDrop = async (date, e) => {
    e.preventDefault();
    setDropTargetDate(null);
    
    if (!draggedTask) return;
    
    try {
      // Update task date
      await calendarService.updateTaskDate(draggedTask.id, date);
      
      // Refresh tasks
      fetchTasks();
      
      // Show success feedback (could use toast)
    } catch (err) {
      console.error('Failed to update task date:', err);
      setError(t('errors.serverError'));
    } finally {
      setDraggedTask(null);
    }
  };
  
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDropTargetDate(null);
  };
  
  // Render calendar header
  const renderHeader = () => {
    const headerTitle = formatDate(currentDate, 
      view === 'month' ? 'MMMM YYYY' : view === 'week' ? 'MMMM D, YYYY' : 'MMMM D, YYYY'
    );
    
    return (
      <div className="calendar-header">
        <div className="calendar-header-left">
          <button className="btn-icon" onClick={handlePrevious} title={t('common.previous')}>
            <Icons.ChevronRight className="w-5 h-5" />
          </button>
          <button className="btn-today" onClick={handleToday}>
            {t('datetime.today')}
          </button>
          <button className="btn-icon" onClick={handleNext} title={t('common.next')}>
            <Icons.ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        
        <div className="calendar-header-center">
          <h2 className="calendar-title">{headerTitle}</h2>
        </div>
        
        <div className="calendar-header-right">
          <div className="view-switcher">
            <button
              className={`view-btn ${view === 'day' ? 'active' : ''}`}
              onClick={() => setView('day')}
            >
              {t('calendar.day')}
            </button>
            <button
              className={`view-btn ${view === 'week' ? 'active' : ''}`}
              onClick={() => setView('week')}
            >
              {t('calendar.week')}
            </button>
            <button
              className={`view-btn ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
            >
              {t('calendar.month')}
            </button>
          </div>
          
          <button className="btn-primary" onClick={() => onCreateTask && onCreateTask()}>
            <Icons.Plus className="w-4 h-4 mr-1" />
            {t('tasks.create')}
          </button>
        </div>
      </div>
    );
  };
  
  // Render calendar grid based on view
  const renderCalendar = () => {
    switch (view) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
      default:
        return renderMonthView();
    }
  };
  
  // Render month view
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const monthNames = availableFormats.monthNames || [];
    
    // Generate calendar days
    const days = [];
    const today = new Date();
    
    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-day-cell empty">
          <span className="day-number">{''}</span>
        </div>
      );
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      const dayTasks = tasksByDate[dateKey] || [];
      const isToday = date.toDateString() === today.toDateString();
      const isCurrentMonth = true;
      const isDropTarget = dropTargetDate === dateKey;
      
      days.push(
        <div
          key={day}
          className={`calendar-day-cell ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${isDropTarget ? 'drop-target' : ''}`}
          onDragOver={(e) => handleDragOver(dateKey, e)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(date, e)}
        >
          <div className="day-header">
            <span className="day-number">{day}</span>
            {dayTasks.length > 0 && (
              <span className="task-count">{dayTasks.length}</span>
            )}
          </div>
          <div className="day-tasks">
            {dayTasks.slice(0, 3).map((task) => (
              <CalendarTaskItem
                key={task.id}
                task={task}
                view="month"
                onClick={() => onTaskClick && onTaskClick(task)}
                onEdit={() => onTaskEdit && onTaskEdit(task)}
                draggable
                onDragStart={(e) => handleDragStart(task, e)}
                onDragEnd={handleDragEnd}
              />
            ))}
            {dayTasks.length > 3 && (
              <button className="more-tasks">
                +{dayTasks.length - 3} {t('calendar.more')}
              </button>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="calendar-grid month-view">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {days}
        </div>
      </div>
    );
  };
  
  // Render week view
  const renderWeekView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    const startOfWeek = new Date(year, month, day - currentDate.getDay());
    const today = new Date();
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
    
    return (
      <div className="calendar-grid week-view">
        <div className="calendar-weekdays week">
          <div className="time-gutter-header"></div>
          {weekDays.map((date, index) => {
            const dateKey = date.toISOString().split('T')[0];
            const dayTasks = tasksByDate[dateKey] || [];
            const isToday = date.toDateString() === today.toDateString();
            
            return (
              <div key={index} className={`weekday-cell ${isToday ? 'today' : ''}`}>
                <div className="weekday-header">
                  <span className="weekday-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="weekday-date">{formatDate(date, 'D')}</span>
                </div>
                <div className="weekday-tasks">
                  {dayTasks.slice(0, 5).map((task) => (
                    <CalendarTaskItem
                      key={task.id}
                      task={task}
                      view="week"
                      compact
                      onClick={() => onTaskClick && onTaskClick(task)}
                      onEdit={() => onTaskEdit && onTaskEdit(task)}
                      draggable
                      onDragStart={(e) => handleDragStart(task, e)}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render day view
  const renderDayView = () => {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayTasks = tasksByDate[dateKey] || [];
    const sortedTasks = [...dayTasks].sort((a, b) => 
      new Date(a.due_date) - new Date(b.due_date)
    );
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const today = new Date();
    const isToday = currentDate.toDateString() === today.toDateString();
    
    return (
      <div className="calendar-grid day-view">
        <div className="day-sidebar">
          <div className="day-date-header">
            <span className="day-name">{currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</span>
            <span className="day-date">{formatDate(currentDate, 'MMMM D, YYYY')}</span>
          </div>
          
          <div className="hour-markers">
            {hours.map((hour) => (
              <div key={hour} className="hour-marker">
                <span className="hour-label">
                  {hour === 0 ? '' : hour.toString().padStart(2, '0') + ':00'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="day-content">
          {isToday && (
            <div className="current-time-indicator" style={{ top: `${(today.getHours() * 60 + today.getMinutes()) / 2}px` }}>
              <div className="time-dot"></div>
              <div className="time-line"></div>
            </div>
          )}
          
          {sortedTasks.map((task) => {
            const taskDate = new Date(task.due_date);
            const top = (taskDate.getHours() * 60 + taskDate.getMinutes()) / 2;
            
            return (
              <div
                key={task.id}
                className="day-task-item"
                style={{ top: `${top}px` }}
                draggable
                onDragStart={(e) => handleDragStart(task, e)}
                onDragEnd={handleDragEnd}
              >
                <CalendarTaskItem
                  task={task}
                  view="day"
                  onClick={() => onTaskClick && onTaskClick(task)}
                  onEdit={() => onTaskEdit && onTaskEdit(task)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render loading state
  if (loading && tasks.length === 0) {
    return (
      <div className="calendar-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="calendar-error">
        <Icons.ExclamationCircle className="w-8 h-8" />
        <p>{error}</p>
        <button className="btn-retry" onClick={fetchTasks}>
          {t('errors.tryAgain')}
        </button>
      </div>
    );
  }
  
  return (
    <div className={`task-calendar ${isJalali ? 'jalali-calendar' : ''}`}>
      <CalendarFilters
        filters={filters}
        onChange={setFilters}
        availableFormats={availableFormats}
      />
      
      {renderHeader()}
      
      <div className="calendar-body">
        {renderCalendar()}
      </div>
      
      <style>{`
        .task-calendar {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: white;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .calendar-header-left,
        .calendar-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .calendar-header-center {
          flex: 1;
          text-align: center;
        }
        
        .calendar-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .btn-icon {
          padding: 8px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }
        
        .btn-icon:hover {
          background: #f3f4f6;
          color: #1f2937;
        }
        
        .btn-today {
          padding: 6px 12px;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-today:hover {
          background: #f3f4f6;
        }
        
        .btn-primary {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-primary:hover {
          background: #2563eb;
        }
        
        .view-switcher {
          display: flex;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 4px;
        }
        
        .view-btn {
          padding: 6px 12px;
          background: none;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .view-btn.active {
          background: white;
          color: #1f2937;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .calendar-body {
          flex: 1;
          overflow: auto;
        }
        
        .calendar-grid {
          min-height: 100%;
        }
        
        .month-view .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }
        
        .weekday {
          padding: 12px;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
        }
        
        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        
        .calendar-day-cell {
          min-height: 120px;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px;
          transition: background 0.2s;
        }
        
        .calendar-day-cell:hover {
          background: #f9fafb;
        }
        
        .calendar-day-cell.today {
          background: #eff6ff;
        }
        
        .calendar-day-cell.drop-target {
          background: #dbeafe;
        }
        
        .calendar-day-cell.other-month {
          background: #f9fafb;
        }
        
        .calendar-day-cell.empty {
          background: #f9fafb;
        }
        
        .day-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .day-number {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        
        .today .day-number {
          background: #3b82f6;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .task-count {
          font-size: 11px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 10px;
        }
        
        .day-tasks {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .more-tasks {
          font-size: 12px;
          color: #6b7280;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          padding: 2px 4px;
        }
        
        .more-tasks:hover {
          color: #3b82f6;
        }
        
        .week-view .calendar-weekdays {
          display: grid;
          grid-template-columns: 60px repeat(7, 1fr);
        }
        
        .weekday-cell {
          border-right: 1px solid #e5e7eb;
          min-height: 600px;
        }
        
        .weekday-header {
          padding: 12px 8px;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        
        .weekday-name {
          display: block;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
        }
        
        .weekday-date {
          display: block;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-top: 4px;
        }
        
        .today .weekday-date {
          background: #3b82f6;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .weekday-tasks {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .day-view .day-sidebar {
          width: 80px;
          border-right: 1px solid #e5e7eb;
          padding: 16px;
        }
        
        .day-date-header {
          text-align: center;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 16px;
        }
        
        .day-name {
          display: block;
          font-size: 14px;
          color: #6b7280;
          text-transform: uppercase;
        }
        
        .day-date {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-top: 4px;
        }
        
        .hour-markers {
          margin-top: 16px;
        }
        
        .hour-marker {
          height: 60px;
          border-top: 1px solid #e5e7eb;
          position: relative;
        }
        
        .hour-label {
          position: absolute;
          top: -8px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
        }
        
        .day-content {
          flex: 1;
          position: relative;
          padding: 16px;
        }
        
        .day-task-item {
          position: absolute;
          left: 16px;
          right: 16px;
        }
        
        .current-time-indicator {
          position: absolute;
          left: 0;
          right: 0;
          z-index: 10;
        }
        
        .time-dot {
          width: 12px;
          height: 12px;
          background: #ef4444;
          border-radius: 50%;
          position: absolute;
          left: -6px;
        }
        
        .time-line {
          height: 2px;
          background: #ef4444;
          position: absolute;
          left: 0;
          right: 0;
          top: 5px;
        }
        
        .calendar-loading,
        .calendar-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          gap: 16px;
        }
        
        .btn-retry {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TaskCalendar;
