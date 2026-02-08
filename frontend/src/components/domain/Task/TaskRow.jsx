/**
 * ============================================================================
 * TaskRow Component
 * Domain component for displaying and editing individual tasks
 * Supports inline editing and quick actions
 * ============================================================================
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './TaskRow.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DateDisplay from '../../ui/DateDisplay';

/**
 * Check if date is overdue
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
const isOverdue = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

/**
 * Check if date is due today
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
const isDueToday = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  const dueDate = new Date(dateString);
  return dueDate.toDateString() === today.toDateString();
};

/**
 * TaskRow Component
 * 
 * @param {Object} props
 * @param {Object} props.task - Task object with id, title, completed, dueDate, priority, tags
 * @param {Function} props.onToggle - Callback when task is toggled
 * @param {Function} props.onEdit - Callback when task is edited
 * @param {Function} props.onOpenDetail - Callback when task detail should open
 * @param {number} props.index - Index for staggered animations
 */
export const TaskRow = ({
  task,
  onToggle,
  onEdit,
  onOpenDetail,
  index = 0,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [isCompleting, setIsCompleting] = useState(false);
  const inputRef = useRef(null);
  const rowRef = useRef(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Handle save
  const handleSave = useCallback(() => {
    if (title.trim() && title.trim() !== task.title) {
      onEdit({ ...task, title: title.trim() });
    }
    setIsEditing(false);
  }, [title, task, onEdit]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setTitle(task.title);
      setIsEditing(false);
    }
  }, [handleSave, task.title]);

  // Handle checkbox click with animation
  const handleToggle = useCallback(() => {
    if (task.completed) {
      setIsCompleting(true);
      setTimeout(() => {
        onToggle(task.id);
        setIsCompleting(false);
      }, 300);
    } else {
      onToggle(task.id);
    }
  }, [task.id, task.completed, onToggle]);

  // Handle row click
  const handleRowClick = useCallback((e) => {
    // Don't trigger if clicking on checkbox or actions
    if (e.target.closest('.task-row__checkbox') || 
        e.target.closest('.task-row__actions')) {
      return;
    }
    if (!isEditing) {
      onOpenDetail(task);
    }
  }, [task, isEditing, onOpenDetail]);

  // Handle double click to edit
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Handle keyboard navigation for accessibility
  const handleRowKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenDetail(task);
    }
  }, [task, onOpenDetail]);

  // Priority class
  const priorityClass = task.priority
    ? `task-row--priority-${task.priority}`
    : '';

  // Due date status
  const dueDateStatus = task.dueDate
    ? (isOverdue(task.dueDate)
        ? 'task-row--overdue'
        : isDueToday(task.dueDate)
          ? 'task-row--due-today'
          : '')
    : '';

  // Animation delay based on index
  const animationStyle = {
    animationDelay: `${Math.min(index * 50, 500)}ms`,
  };

  return (
    <div
      ref={rowRef}
      className={[
        'task-row',
        'stagger-item',
        task.completed && 'task-row--complete',
        isCompleting && 'task-row--completing',
        priorityClass,
        dueDateStatus,
      ].filter(Boolean).join(' ')}
      style={animationStyle}
      onClick={handleRowClick}
      onDoubleClick={handleDoubleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleRowKeyDown}
      aria-label={`Task: ${task.title}. ${task.completed ? 'Completed' : 'Not completed'}. Press Enter to open details.`}
      aria-expanded={false}
    >
      {/* Checkbox */}
      <button
        className="task-row__checkbox"
        onClick={(e) => { e.stopPropagation(); handleToggle(); }}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        aria-checked={task.completed}
        role="checkbox"
      >
        {task.completed ? (
          <CheckCircleIcon/>
        ) : (
          <RadioButtonUncheckedIcon className="task-row__checkbox-icon" aria-hidden="true" />
        )}
      </button>

      {/* Title - Editable */}
      <div className="task-row__content">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="task-row__input"
            aria-label="Edit task title"
            aria-describedby="task-title-edit-hint"
          />
        ) : (
          <span
            className="task-row__title"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setIsEditing(true); } }}
          >
            {task.title}
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="task-row__meta" role="group" aria-label="Task metadata">
        {/* Due Date */}
        {task.dueDate && (
          <span
            className={[
              'task-row__due-date',
              isOverdue(task.dueDate) && 'task-row__due-date--overdue',
              isDueToday(task.dueDate) && 'task-row__due-date--today',
            ].filter(Boolean).join(' ')}
          >
            <CalendarTodayIcon className="task-row__icon" aria-hidden="true" />
            <span className="sr-only">Due: </span>
            <DateDisplay date={task.dueDate} variant="compact" />
          </span>
        )}

        {/* Priority Chip */}
        {task.priority && task.priority !== 'none' && (
          <span
            className={[
              'task-row__priority',
              `task-row__priority--${task.priority}`,
            ].filter(Boolean).join(' ')}
            aria-label={`Priority: ${task.priority}`}
          >
            {task.priority === 'high' && '!'}
            {task.priority === 'medium' && '!!'}
            {task.priority === 'low' && '↓'}
          </span>
        )}

        {/* Tags */}
        {task.tags?.map((tag) => (
          <span
            key={tag.id}
            className="task-row__tag"
            style={{ '--tag-color': tag.color }}
            aria-label={`Tag: ${tag.name}`}
          >
            {tag.name}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="task-row__actions" role="group" aria-label="Task actions">
        <button
          className="task-row__action"
          onClick={(e) => { e.stopPropagation(); onOpenDetail(task); }}
          aria-label="Open task details"
        >
          <ChevronRightIcon className="task-row__action-icon" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

TaskRow.displayName = 'TaskRow';

export default TaskRow;
