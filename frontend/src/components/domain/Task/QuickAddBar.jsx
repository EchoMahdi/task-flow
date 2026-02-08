/**
 * ============================================================================
 * QuickAddBar Component
 * Domain component for quick task creation
 * Supports inline task entry with Enter to submit
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { Add, Close, ArrowForward } from '@mui/icons-material';
import { TaskModel, createQuickTask, ValidationError } from '../../../models/TaskModel';
import './QuickAddBar.css';

/**
 * QuickAddBar Component
 * 
 * Uses TaskModel for all task creation logic
 * 
 * @param {Object} props
 * @param {Function} props.onTaskCreated - Callback when task is successfully created
 * @param {Function} props.onError - Callback when an error occurs
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.autoFocus - Auto-focus the input
 * @param {Object} props.defaultValues - Default values for new tasks
 */
const QuickAddBar = ({
  onTaskCreated,
  onError,
  placeholder = 'Add a new task...',
  autoFocus = true,
  defaultValues = {},
}) => {
  const [title, setTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded, autoFocus]);

  // Handle input change
  const handleChange = (e) => {
    setTitle(e.target.value);
    if (error) {
      setError(null);
    }
  };

  // Handle form submission using TaskModel
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedTitle = title.trim();
    
    if (!trimmedTitle) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use TaskModel's createQuickTask helper for quick task creation
      const result = await createQuickTask(trimmedTitle, defaultValues);
      
      // Notify parent of successful creation
      if (onTaskCreated) {
        onTaskCreated(result.data);
      }
      
      // Reset form
      setTitle('');
      setIsExpanded(false);
    } catch (error) {
      // Handle validation errors
      if (error instanceof ValidationError) {
        setError(error.validationErrors?.title || 'Invalid task data');
      } else {
        setError(error.message || 'Failed to create task');
      }
      
      // Notify parent of error
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setTitle('');
    setError(null);
    setIsExpanded(false);
  };

  // Handle key down
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  // Handle expand
  const handleExpand = () => {
    setIsExpanded(true);
  };

  return (
    <div className="quick-add-bar">
      <form onSubmit={handleSubmit} className="quick-add-bar__form">
        {/* Expand toggle button */}
        {!isExpanded && (
          <button
            type="button"
            className="quick-add-bar__toggle"
            onClick={handleExpand}
            aria-label="Add new task"
          >
            <Add className="quick-add-bar__icon" />
            <span className="quick-add-bar__placeholder">{placeholder}</span>
          </button>
        )}

        {/* Expanded input */}
        {isExpanded && (
          <>
            {/* Add icon */}
            <div className="quick-add-bar__icon-wrapper">
              <Add className="quick-add-bar__icon" />
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={`quick-add-bar__input ${error ? 'quick-add-bar__input--error' : ''}`}
              placeholder="What needs to be done?"
              aria-label="Task title"
              disabled={isLoading}
            />

            {/* Actions */}
            <div className="quick-add-bar__actions">
              <button
                type="button"
                className="quick-add-bar__cancel"
                onClick={handleCancel}
                aria-label="Cancel"
                disabled={isLoading}
              >
                <Close className="quick-add-bar__action-icon" />
              </button>
              <button
                type="submit"
                className="quick-add-bar__submit"
                disabled={!title.trim() || isLoading}
                aria-label="Add task"
              >
                {isLoading ? (
                  <span className="quick-add-bar__spinner" />
                ) : (
                  <ArrowForward className="quick-add-bar__action-icon" />
                )}
              </button>
            </div>
          </>
        )}

        {/* Error message */}
        {error && (
          <div className="quick-add-bar__error">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

QuickAddBar.displayName = 'QuickAddBar';

export default QuickAddBar;
