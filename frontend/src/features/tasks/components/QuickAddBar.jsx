/**
 * ============================================================================
 * QuickAddBar Component
 * Domain component for quickly adding tasks inline
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { Add, Close, ArrowForward } from '@mui/icons-material';
import { TaskModel, createQuickTask, ValidationError } from '@/models/TaskModel';
import { useI18nStore } from '@/stores/i18nStore';
import './QuickAddBar.css';

/**
 * QuickAddBar Component
 * Provides inline task creation with minimal UI
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback when task is submitted
 * @param {string} props.defaultProjectId - Default project ID for new tasks
 */
export const QuickAddBar = ({ onSubmit, defaultProjectId = null }) => {
  const t = useI18nStore((state) => state.t);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const taskData = createQuickTask({
        title: title.trim(),
        project_id: defaultProjectId,
      });
      await onSubmit(taskData);
      setTitle('');
      setIsOpen(false);
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error('Validation error:', error.message);
      } else {
        console.error('Error creating task:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle key down
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setTitle('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        className="quick-add-bar__trigger"
        onClick={() => setIsOpen(true)}
        aria-label={t('Add new task')}
      >
        <Add />
        <span>{t('Add task')}</span>
      </button>
    );
  }

  return (
    <form
      className="quick-add-bar"
      onSubmit={handleSubmit}
      aria-label={t('Quick add task')}
    >
      <input
        ref={inputRef}
        type="text"
        className="quick-add-bar__input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('What needs to be done?')}
        aria-label={t('Task title')}
        disabled={isSubmitting}
      />
      <div className="quick-add-bar__actions">
        <button
          type="submit"
          className="quick-add-bar__submit"
          disabled={!title.trim() || isSubmitting}
          aria-label={t('Submit task')}
        >
          {isSubmitting ? (
            <span className="quick-add-bar__loading" />
          ) : (
            <ArrowForward />
          )}
        </button>
        <button
          type="button"
          className="quick-add-bar__cancel"
          onClick={() => {
            setTitle('');
            setIsOpen(false);
          }}
          aria-label={t('Cancel')}
          disabled={isSubmitting}
        >
          <Close />
        </button>
      </div>
    </form>
  );
};

QuickAddBar.displayName = 'QuickAddBar';
export default QuickAddBar;
