/**
 * ============================================================================
 * TaskList Component
 * Domain component for displaying a list of tasks
 * Supports filtering, sorting, and bulk actions
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { TaskRow } from './TaskRow';
import { QuickAddBar } from './QuickAddBar';
import { Icons } from '../../ui/Icons';
import './TaskList.css';

/**
 * Sort tasks by date
 * @param {Array} tasks - Array of task objects
 * @param {string} sortBy - Sort field
 * @param {string} sortOrder - Sort order (asc|desc)
 */
const sortTasks = (tasks, sortBy, sortOrder) => {
  const sorted = [...tasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate) - new Date(b.dueDate);
        break;
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
        comparison = (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'created':
      default:
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
};

/**
 * TaskList Component
 * 
 * @param {Object} props
 * @param {Array} props.tasks - Array of task objects
 * @param {Function} props.onToggleTask - Callback when task is toggled
 * @param {Function} props.onUpdateTask - Callback when task is updated
 * @param {Function} props.onDeleteTask - Callback when task is deleted
 * @param {Function} props.onOpenDetail - Callback when task detail should open
 * @param {Function} props.onAddTask - Callback when new task is added
 * @param {Object} props.filters - Current filters
 * @param {string} props.sortBy - Sort field
 * @param {string} props.sortOrder - Sort order
 */
export const TaskList = ({
  tasks = [],
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onOpenDetail,
  onAddTask,
  filters = {},
  sortBy = 'dueDate',
  sortOrder = 'asc',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    
    // Filter by completed status
    if (filters.showCompleted === false) {
      result = result.filter((task) => !task.completed);
    } else if (filters.showCompleted === true) {
      result = result.filter((task) => task.completed);
    }
    
    // Filter by priority
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter((task) => task.priority === filters.priority);
    }
    
    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((task) => 
        task.tags?.some((tag) => filters.tags.includes(tag.id))
      );
    }
    
    // Filter by search query
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter((task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }
    
    // Sort tasks
    result = sortTasks(result, sortBy, sortOrder);
    
    return result;
  }, [tasks, filters, sortBy, sortOrder]);

  // Group tasks by date if needed
  const groupedTasks = useMemo(() => {
    if (!filters.groupBy) return { all: filteredTasks };
    
    const groups = {};
    filteredTasks.forEach((task) => {
      const key = task.dueDate 
        ? new Date(task.dueDate).toDateString() 
        : 'no-date';
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(task);
    });
    
    return groups;
  }, [filteredTasks, filters.groupBy]);

  // Handle add task
  const handleAddTask = (taskData) => {
    if (onAddTask) {
      onAddTask(taskData);
    }
  };

  // Handle toggle task
  const handleToggleTask = (taskId) => {
    if (onToggleTask) {
      onToggleTask(taskId);
    }
  };

  // Handle update task
  const handleUpdateTask = (task) => {
    if (onUpdateTask) {
      onUpdateTask(task);
    }
  };

  // Handle delete task
  const handleDeleteTask = (taskId) => {
    if (onDeleteTask) {
      onDeleteTask(taskId);
    }
  };

  // Handle open task detail
  const handleOpenDetail = (task) => {
    if (onOpenDetail) {
      onOpenDetail(task);
    }
  };

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="task-list">
        <div className="task-list__empty">
          <Icons.ClipboardList className="task-list__empty-icon" />
          <h3 className="task-list__empty-title">No tasks yet</h3>
          <p className="task-list__empty-description">
            Create your first task to get started
          </p>
          <button
            className="task-list__empty-action"
            onClick={() => setIsExpanded(true)}
          >
            <Icons.Plus className="task-list__empty-action-icon" />
            Add your first task
          </button>
        </div>
        
        {isExpanded && (
          <QuickAddBar
            onAddTask={handleAddTask}
            autoFocus
          />
        )}
      </div>
    );
  }

  return (
    <div className="task-list">
      {/* Quick Add Bar */}
      <QuickAddBar
        onAddTask={handleAddTask}
        autoFocus={false}
      />
      
      {/* Task List */}
      <div className="task-list__items">
        {filteredTasks.length === 0 ? (
          <div className="task-list__no-results">
            <Icons.Search className="task-list__no-results-icon" />
            <p className="task-list__no-results-text">No tasks match your filters</p>
          </div>
        ) : filters.groupBy ? (
          // Grouped view
          Object.entries(groupedTasks).map(([groupDate, groupTasks]) => (
            <div key={groupDate} className="task-list__group">
              <h3 className="task-list__group-title">
                {groupDate === 'no-date' ? 'No due date' : groupDate}
              </h3>
              <div className="task-list__group-items">
                {groupTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={handleUpdateTask}
                    onOpenDetail={handleOpenDetail}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Flat view
          filteredTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onEdit={handleUpdateTask}
              onOpenDetail={handleOpenDetail}
            />
          ))
        )}
      </div>
      
      {/* Footer with task count */}
      {filteredTasks.length > 0 && (
        <div className="task-list__footer">
          <span className="task-list__count">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </span>
          {filters.showCompleted === false && (
            <button
              className="task-list__show-completed"
              onClick={() => {/* TODO: Toggle show completed */}}
            >
              Show completed
            </button>
          )}
        </div>
      )}
    </div>
  );
};

TaskList.displayName = 'TaskList';

export default TaskList;
