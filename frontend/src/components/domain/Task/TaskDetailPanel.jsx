/**
 * ============================================================================
 * TaskDetailPanel Component
 * Domain component for slide-in task detail panel
 * Provides full task editing capabilities
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import CheckIcon from '@mui/icons-material/CheckIcon';
import CloseIcon from '@mui/icons-material/CloseIcon';
import DeleteIcon from '@mui/icons-material/DeleteIcon';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from '@/context/I18nContext';
import { Input, TextField, Select } from '@/components/ui/index';
import DateDisplay from '@/components/ui/DateDisplay';
import './TaskDetailPanel.css';

/**
 * Priority options
 */
const priorityOptions = [
  { value: 'none', label: t('None') },
  { value: 'low', label: t('Low') },
  { value: 'medium', label: t('Medium') },
  { value: 'high', label: t('High') },
];

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

/**
 * TaskDetailPanel Component
 * 
 * @param {Object} props
 * @param {Object} props.task - Task object
 * @param {boolean} props.isOpen - Whether panel is open
 * @param {Function} props.onClose - Callback when panel closes
 * @param {Function} props.onUpdate - Callback when task is updated
 * @param {Function} props.onDelete - Callback when task is deleted
 * @param {Function} props.onToggle - Callback when task is toggled
 */
export const TaskDetailPanel = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onToggle,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'none',
    tags: [],
  });
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: formatDate(task.dueDate),
        priority: task.priority || 'none',
        tags: task.tags || [],
      });
      setIsDirty(false);
      setShowDeleteConfirm(false);
    }
  }, [task]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  // Handle save
  const handleSave = async () => {
    if (onUpdate && !loading) {
      setLoading(true);
      try {
        await onUpdate({
          ...task,
          ...formData,
        });
        setIsDirty(false);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (onDelete && !loading) {
      setLoading(true);
      try {
        await onDelete(task.id);
        onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isDirty) {
      // Reset to original values
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: formatDate(task.dueDate),
        priority: task.priority || 'none',
        tags: task.tags || [],
      });
      setIsDirty(false);
    }
    onClose();
  };

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  // Handle keyboard (Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isDirty]);

  // Don't render if not open or no task
  if (!isOpen || !task) {
    return null;
  }

  return (
    <div className="task-detail-panel-wrapper">
      {/* Overlay */}
      <div 
        className="task-detail-panel__overlay"
        onClick={handleOverlayClick}
      />

      {/* Panel */}
      <div className="task-detail-panel">
        {/* Header */}
        <div className="task-detail-panel__header">
          <div className="task-detail-panel__header-left">
            {/* Complete checkbox */}
            <button
              className={[
                'task-detail-panel__complete',
                task.completed && 'task-detail-panel__complete--checked',
              ].filter(Boolean).join(' ')}
              onClick={() => onToggle && onToggle(task.id)}
              aria-label={task.completed ? t('Mark as incomplete') : t('Mark as complete')}
            >
              {task.completed && (
                <CheckIcon />
              )}
            </button>

            {/* Title */}
            <h2 className="task-detail-panel__title">
              {task.completed ? (
                <span className="task-detail-panel__title--completed">
                  {formData.title}
                </span>
              ) : (
                formData.title || t('Untitled Task')
              )}
            </h2>
          </div>

          {/* Close button */}
          <button
            className="task-detail-panel__close"
            onClick={handleCancel}
            aria-label={t('Close task details')}
          >
            <CloseIcon  />
          </button>
        </div>

        {/* Content */}
        <div className="task-detail-panel__content">
          {/* Title Input */}
          <div className="task-detail-panel__field">
            <Input
              label={t('Title')}
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('What needs to be done?')}
              disabled={task.completed}
            />
          </div>

          {/* Description */}
          <div className="task-detail-panel__field">
            < TextField
             multiline
              label={t('Description')}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('Add more details...')}
              rows={4}
              disabled={task.completed}
            />
          </div>

          {/* Due Date */}
          <div className="task-detail-panel__field">
            <Input
              label={t('Due Date')}
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={task.completed}
            />
          </div>

          {/* Priority */}
          <div className="task-detail-panel__field">
            <Select
              label={t('Priority')}
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={priorityOptions}
              disabled={task.completed}
            />
          </div>

          {/* Tags */}
          <div className="task-detail-panel__field">
            <label className="task-detail-panel__label">Tags</label>
            <div className="task-detail-panel__tags">
              {formData.tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="task-detail-panel__tag"
                  style={{ '--tag-color': tag.color }}
                >
                  {tag.name}
                </span>
              ))}
              {(!formData.tags || formData.tags.length === 0) && (
                <span className="task-detail-panel__tags-empty">
                  {t('No tags')}
                </span>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="task-detail-panel__meta">
            <div className="task-detail-panel__meta-item">
              <span className="task-detail-panel__meta-label">{t('Created')}</span>
              <span className="task-detail-panel__meta-value">
                {task.createdAt 
                  ? <DateDisplay date={task.createdAt} variant="compact" />
                  : 'Unknown'
                }
              </span>
            </div>
            {task.updatedAt && (
              <div className="task-detail-panel__meta-item">
                <span className="task-detail-panel__meta-label">{t('Updated')}</span>
                <span className="task-detail-panel__meta-value">
                  <DateDisplay date={task.updatedAt} variant="compact" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="task-detail-panel__footer">
          {showDeleteConfirm ? (
            <div className="task-detail-panel__delete-confirm">
              <span className="task-detail-panel__delete-question">
                {t('Are you sure you want to delete this task?')}
              </span>
              <div className="task-detail-panel__delete-actions">
                <button
                  className="task-detail-panel__delete-cancel"
                  onClick={() => !loading && setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  {t('Cancel')}
                </button>
                <button
                  className="task-detail-panel__delete-confirm-btn"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />
                      {t('Processing...')}
                    </>
                  ) : (
                    t('Delete')
                  )}
                </button>
              </div>
            </div>
          ) : (
            <React.Fragment>
              <button
                className="task-detail-panel__delete"
                onClick={() => !loading && setShowDeleteConfirm(true)}
                disabled={loading}
              >
                <DeleteIcon />
                {t('Delete')}
              </button>

              <div className="task-detail-panel__actions">
                <button
                  className="task-detail-panel__cancel"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {t('Cancel')}
                </button>
                <button
                  className="task-detail-panel__save"
                  onClick={handleSave}
                  disabled={!isDirty || loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />
                      {t('Saving...')}
                    </>
                  ) : (
                    t('Save Changes')
                  )}
                </button>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

TaskDetailPanel.displayName = 'TaskDetailPanel';

export default TaskDetailPanel;
