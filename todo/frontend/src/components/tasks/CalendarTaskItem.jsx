import React from 'react';
import { useTranslation } from '../../context/I18nContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import { Icons } from '../ui/Icons';

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
  
  // Priority colors
  const priorityColors = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#dc2626',
  };
  
  // Status styles
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'task-completed';
      case 'in_progress':
        return 'task-progress';
      case 'pending':
      default:
        return 'task-pending';
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
  
  // Priority badge
  const renderPriorityBadge = () => {
    const color = priorityColors[task.priority] || priorityColors.medium;
    
    return (
      <span 
        className="priority-badge"
        style={{ backgroundColor: color }}
        title={t(`priority.${task.priority}`)}
      />
    );
  };
  
  // Completed checkmark
  const renderCompletedCheck = () => {
    if (task.status !== 'completed') return null;
    
    return (
      <span className="completed-check">
        <Icons.Check className="w-3 h-3" />
      </span>
    );
  };
  
  // Main content based on view and compact mode
  if (compact || view === 'week') {
    return (
      <div
        className={`calendar-task-item compact ${getStatusClass(task.status)}`}
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
        {renderPriorityBadge()}
        <span className="task-title-compact">{task.title}</span>
        {renderCompletedCheck()}
      </div>
    );
  }
  
  return (
    <div
      className={`calendar-task-item ${getStatusClass(task.status)}`}
      onClick={handleClick}
      onDoubleClick={handleEdit}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      tabIndex={0}
      role="button"
      aria-label={`${task.title} - ${formatDueDate(task.due_date)}`}
    >
      <div className="task-header">
        {renderPriorityBadge()}
        <span className="task-time">{formatDueDate(task.due_date)}</span>
        {renderCompletedCheck()}
      </div>
      
      <div className="task-content">
        <span className="task-title">{task.title}</span>
        
        {task.tags && task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.slice(0, 2).map((tag) => (
              <span 
                key={tag.id} 
                className="task-tag"
                style={{ backgroundColor: tag.color || '#6b7280' }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {task.description && (
        <div className="task-description">
          {task.description.length > 50 
            ? task.description.substring(0, 50) + '...' 
            : task.description}
        </div>
      )}
      
      <style>{`
        .calendar-task-item {
          padding: 6px 8px;
          border-radius: 6px;
          background: white;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }
        
        .calendar-task-item:hover {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        .calendar-task-item:focus {
          box-shadow: 0 0 0 2px #3b82f6;
        }
        
        .calendar-task-item.compact {
          padding: 4px 6px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .calendar-task-item.compact .task-title-compact {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .task-completed {
          opacity: 0.6;
          text-decoration: line-through;
        }
        
        .task-completed .task-title,
        .task-completed .task-title-compact {
          text-decoration: line-through;
        }
        
        .task-progress {
          border-left: 3px solid #3b82f6;
        }
        
        .task-pending {
          border-left: 3px solid #6b7280;
        }
        
        .priority-badge {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .task-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 4px;
        }
        
        .task-time {
          font-size: 11px;
          color: #6b7280;
        }
        
        .completed-check {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          background: #22c55e;
          border-radius: 50%;
          color: white;
        }
        
        .task-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .task-title {
          font-size: 13px;
          font-weight: 500;
          color: #1f2937;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .task-tags {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        
        .task-tag {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          color: white;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .task-description {
          font-size: 11px;
          color: #6b7280;
          margin-top: 4px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default CalendarTaskItem;
