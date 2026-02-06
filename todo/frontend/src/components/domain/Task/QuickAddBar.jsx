/**
 * ============================================================================
 * QuickAddBar Component
 * Domain component for quick task creation
 * Supports inline task entry with Enter to submit
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../../ui/Icons';
import './QuickAddBar.css';

/**
 * QuickAddBar Component
 * 
 * @param {Object} props
 * @param {Function} props.onAddTask - Callback when task is added
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.autoFocus - Auto-focus the input
 */
 const QuickAddBar = ({
  onAddTask,
  placeholder = 'Add a new task...',
  autoFocus = true,
}) => {
  const [title, setTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
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
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedTitle = title.trim();
    
    if (trimmedTitle) {
      onAddTask({ title: trimmedTitle });
      setTitle('');
      setIsExpanded(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setTitle('');
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
            <Icons.Plus className="quick-add-bar__icon" />
            <span className="quick-add-bar__placeholder">{placeholder}</span>
          </button>
        )}

        {/* Expanded input */}
        {isExpanded && (
          <>
            {/* Add icon */}
            <div className="quick-add-bar__icon-wrapper">
              <Icons.Plus className="quick-add-bar__icon" />
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="quick-add-bar__input"
              placeholder="What needs to be done?"
              aria-label="Task title"
            />

            {/* Actions */}
            <div className="quick-add-bar__actions">
              <button
                type="button"
                className="quick-add-bar__cancel"
                onClick={handleCancel}
                aria-label="Cancel"
              >
                <Icons.X className="quick-add-bar__action-icon" />
              </button>
              <button
                type="submit"
                className="quick-add-bar__submit"
                disabled={!title.trim()}
                aria-label="Add task"
              >
                <Icons.ArrowRight className="quick-add-bar__action-icon" />
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

QuickAddBar.displayName = 'QuickAddBar';

export default QuickAddBar;
