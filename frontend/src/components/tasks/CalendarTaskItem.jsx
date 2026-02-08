import React from 'react';
import { useTranslation } from '../../context/I18nContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * CalendarTaskItem Component
 * 
 * Displays a task within the calendar view with:
 * - Priority indicator
 * - Status indicator
 * - Title and due time
 * - Click and edit handlers
 * - Drag and drop support
 */
const CalendarTaskItem = ({
  task,
  view = 'month',
  compact = false,
  onClick,
  onEdit,
  draggable = false,
  onDragStart,
  onDragEnd,
}) => {
  const { t } = useTranslation();
  const { formatDate, formatTime, isJalali } = useDateFormat();
  
  // Priority colors (MUI palette)
  const priorityColors = {
    low: 'success.main',
    medium: 'warning.main',
    high: 'error.main',
    urgent: 'error.dark',
  };
  
  // Status styles
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'pending':
      default:
        return 'default';
    }
  };
  
  // Format due date
  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    
    if (view === 'day' || view === 'week') {
      return formatTime(date);
    }
    
    return formatDate(date, 'MMM D');
  };
  
  // Handle click
  const handleClick = (e) => {
    e.stopPropagation();
    onClick && onClick();
  };
  
  // Handle edit
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit && onEdit();
  };
  
  // Handle drag start
  const handleDragStart = (e) => {
    if (draggable) {
      e.dataTransfer.setData('text/plain', task.id.toString());
      e.dataTransfer.effectAllowed = 'move';
      onDragStart && onDragStart(e);
    }
  };
  
  // Handle drag end
  const handleDragEnd = (e) => {
    onDragEnd && onDragEnd(e);
  };
  
  // Priority badge color
  const priorityColor = priorityColors[task.priority] || priorityColors.medium;
  
  // Is completed
  const isCompleted = task.status === 'completed';
  
  // Compact mode or week view
  if (compact || view === 'week') {
    return (
      <Box
        sx={{
          p: 0.75,
          borderRadius: 1,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s ease',
          opacity: isCompleted ? 0.6 : 1,
          textDecoration: isCompleted ? 'line-through' : 'none',
          borderLeft: '3px solid',
          borderLeftColor: task.status === 'in_progress' ? 'primary.main' : task.status === 'completed' ? 'success.main' : 'grey.500',
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-1px)',
          },
          '&:focus': {
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
          },
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
        onClick={handleClick}
        onDoubleClick={handleEdit}
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        title={task.title}
        tabIndex={0}
        role="button"
        aria-label={`${task.title} - ${t(`status.${task.status}`)}`}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: priorityColor,
            flexShrink: 0,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textDecoration: isCompleted ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </Typography>
        {isCompleted && (
          <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
        )}
      </Box>
    );
  }
  
  // Full mode (month view)
  return (
    <Box
      sx={{
        p: 0.75,
        borderRadius: 1,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.2s ease',
        borderLeft: '3px solid',
        borderLeftColor: task.status === 'in_progress' ? 'primary.main' : task.status === 'completed' ? 'success.main' : 'grey.500',
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-1px)',
        },
        '&:focus': {
          boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
        },
      }}
      onClick={handleClick}
      onDoubleClick={handleEdit}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      tabIndex={0}
      role="button"
      aria-label={`${task.title} - ${formatDueDate(task.due_date)}`}
    >
      {/* Task header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: priorityColor,
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
            {formatDueDate(task.due_date)}
          </Typography>
        </Box>
        {isCompleted && (
          <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
        )}
      </Box>
      
      {/* Task content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: 13,
            fontWeight: 500,
            color: 'text.primary',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textDecoration: isCompleted ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </Typography>
        
        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {task.tags.slice(0, 2).map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                size="small"
                sx={{
                  fontSize: 10,
                  height: 18,
                  bgcolor: tag.color || 'grey.500',
                  color: 'white',
                  maxWidth: 80,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              />
            ))}
          </Box>
        )}
      </Box>
      
      {/* Description */}
      {task.description && (
        <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5, lineHeight: 1.4 }}>
          {task.description.length > 50 
            ? task.description.substring(0, 50) + '...' 
            : task.description}
        </Typography>
      )}
    </Box>
  );
};

export default CalendarTaskItem;
