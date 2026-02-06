import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import calendarService from '../../services/calendarService';
import dateService from '../../services/dateService';
import CalendarTaskItem from './CalendarTaskItem';
import CalendarFilters from './CalendarFilters';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid';

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
  
  // Format header title
  const headerTitle = formatDate(currentDate, 
    view === 'month' ? 'MMMM YYYY' : view === 'week' ? 'MMMM D, YYYY' : 'MMMM D, YYYY'
  );
  
  // Is view active
  const isViewActive = (viewName) => view === viewName;
  
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
        <Box
          key={`empty-${i}`}
          sx={{
            minHeight: 120,
            borderRight: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
            p: 1,
            bgcolor: 'grey.50',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>{''}</Typography>
        </Box>
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
        <Box
          key={day}
          sx={{
            minHeight: 120,
            borderRight: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
            p: 1,
            bgcolor: isToday ? 'primary.50' : isDropTarget ? 'info.50' : 'background.paper',
            transition: 'background 0.2s',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          onDragOver={(e) => handleDragOver(dateKey, e)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(date, e)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: isToday ? 700 : 400,
                color: isToday ? 'primary.main' : 'text.primary',
              }}
            >
              {day}
            </Typography>
            {dayTasks.length > 0 && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {dayTasks.length}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
              <Button
                size="small"
                sx={{ 
                  fontSize: 11, 
                  py: 0,
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                }}
              >
                +{dayTasks.length - 3} {t('calendar.more')}
              </Button>
            )}
          </Box>
        </Box>
      );
    }
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <Box>
        {/* Weekday headers */}
        <Grid container sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          {weekDays.map((day) => (
            <Grid item xs={12/7} key={day}>
              <Box sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {day}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        
        {/* Calendar days */}
        <Grid container>
          {days}
        </Grid>
      </Box>
    );
  };
  
  // Render week view
  const renderWeekView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    const startOfWeek = new Date(year, month, day - currentDate.getDay());
    const today = new Date();
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
    
    const weekDaysHeader = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Weekday headers */}
        <Grid container sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid item sx={{ width: 60, flexShrink: 0 }}>
            <Box sx={{ p: 1 }} />
          </Grid>
          {weekDays.map((date, index) => {
            const dateKey = date.toISOString().split('T')[0];
            const dayTasks = tasksByDate[dateKey] || [];
            const isToday = date.toDateString() === today.toDateString();
            
            return (
              <Grid item xs key={index} sx={{ flex: 1 }}>
                <Box 
                  sx={{ 
                    p: 1, 
                    textAlign: 'center',
                    bgcolor: isToday ? 'primary.50' : 'grey.50',
                    borderLeft: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {weekDaysHeader[index]}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? 'primary.main' : 'text.primary',
                    }}
                  >
                    {date.getDate()}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
        
        {/* Week tasks */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Grid container sx={{ height: '100%' }}>
            <Grid item sx={{ width: 60, flexShrink: 0 }}>
              <Box sx={{ height: '100%' }}>
                {Array.from({ length: 24 }, (_, i) => (
                  <Box 
                    key={i} 
                    sx={{ 
                      height: 60, 
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      p: 0.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {i === 0 ? '' : `${i.toString().padStart(2, '0')}:00`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            {weekDays.map((date, index) => {
              const dateKey = date.toISOString().split('T')[0];
              const dayTasks = tasksByDate[dateKey] || [];
              const isToday = date.toDateString() === today.toDateString();
              
              return (
                <Grid item xs key={index} sx={{ flex: 1, borderLeft: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ position: 'relative', height: '100%' }}>
                    {isToday && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: `${(today.getHours() * 60 + today.getMinutes())}px`,
                          borderTop: '2px solid',
                          borderColor: 'error.main',
                          zIndex: 10,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'error.main',
                            transform: 'translateY(-50%)',
                            ml: -0.5,
                          }}
                        />
                      </Box>
                    )}
                    {dayTasks.slice(0, 5).map((task) => (
                      <Box key={task.id} sx={{ position: 'relative', zIndex: 1 }}>
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
                      </Box>
                    ))}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
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
      <Box sx={{ display: 'flex', height: '100%' }}>
        {/* Time sidebar */}
        <Box sx={{ width: 60, flexShrink: 0, bgcolor: 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 1, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatDate(currentDate, 'MMMM D, YYYY')}
            </Typography>
          </Box>
          {hours.map((hour) => (
            <Box 
              key={hour} 
              sx={{ 
                height: 60, 
                borderBottom: '1px solid',
                borderColor: 'divider',
                p: 0.5,
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {hour === 0 ? '' : `${hour.toString().padStart(2, '0')}:00`}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {/* Day content */}
        <Box sx={{ flex: 1, position: 'relative', overflow: 'auto' }}>
          {isToday && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${(today.getHours() * 60 + today.getMinutes())}px`,
                borderTop: '2px solid',
                borderColor: 'error.main',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  transform: 'translateY(-50%)',
                  ml: -0.5,
                }}
              />
              <Box sx={{ flex: 1, height: 2, bgcolor: 'error.main', opacity: 0.5 }} />
            </Box>
          )}
          
          {sortedTasks.map((task) => {
            const taskDate = new Date(task.due_date);
            const top = (taskDate.getHours() * 60 + taskDate.getMinutes());
            
            return (
              <Box
                key={task.id}
                sx={{
                  position: 'absolute',
                  left: 4,
                  right: 4,
                  top: `${top}px`,
                  zIndex: 5,
                }}
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
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };
  
  // Render loading state
  if (loading && tasks.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>{t('common.loading')}</Typography>
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="outlined" onClick={fetchTasks}>{t('errors.tryAgain')}</Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
      <CalendarFilters
        filters={filters}
        onChange={setFilters}
        availableFormats={availableFormats}
      />
      
      {/* Calendar Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handlePrevious} size="small">
            <ChevronRightIcon />
          </IconButton>
          <Button variant="outlined" size="small" onClick={handleToday}>
            {t('datetime.today')}
          </Button>
          <IconButton onClick={handleNext} size="small">
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {headerTitle}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* View Switcher */}
          <Box sx={{ display: 'flex', bgcolor: 'grey.100', borderRadius: 1, p: 0.5 }}>
            {['day', 'week', 'month'].map((viewName) => (
              <Button
                key={viewName}
                size="small"
                onClick={() => setView(viewName)}
                variant={isViewActive(viewName) ? 'contained' : 'text'}
                color={isViewActive(viewName) ? 'primary' : 'inherit'}
                sx={{ 
                  minWidth: 'auto',
                  px: 1.5,
                  textTransform: 'none',
                  fontSize: 13,
                }}
              >
                {t(`calendar.${viewName}`)}
              </Button>
            ))}
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => onCreateTask && onCreateTask()}
          >
            {t('tasks.create')}
          </Button>
        </Box>
      </Box>
      
      {/* Calendar Body */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {renderCalendar()}
      </Box>
    </Box>
  );
};

export default TaskCalendar;
