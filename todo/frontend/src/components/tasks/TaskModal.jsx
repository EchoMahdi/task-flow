import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { Icons } from '../ui/Icons';
import { useDateFormat } from '../../hooks/useDateFormat';
import taskService from '../../services/taskService';

/**
 * TaskModal Component
 * 
 * Modal for viewing, creating, and editing tasks
 */
const TaskModal = ({
  task,
  mode = 'view', // 'view', 'create', 'edit'
  onClose,
  onSave,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { formatDate, formatTime, preferences } = useDateFormat();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    tags: [],
  });
  
  // Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize form data
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        tags: task.tags || [],
      });
    }
  }, [task]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle status change
  const handleStatusChange = (status) => {
    setFormData((prev) => ({ ...prev, status }));
  };
  
  // Handle priority change
  const handlePriorityChange = (priority) => {
    setFormData((prev) => ({ ...prev, priority }));
  };
  
  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let savedTask;
      
      if (mode === 'create') {
        savedTask = await taskService.create(formData);
      } else if (mode === 'edit') {
        savedTask = await taskService.update(task.id, formData);
      }
      
      onSave(savedTask, mode);
    } catch (err) {
      console.error('Failed to save task:', err);
      setError(err.response?.data?.message || t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm(t('tasks.deleteConfirm'))) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await taskService.delete(task.id);
      onDelete(task);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError(err.response?.data?.message || t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };
  
  // Priority options
  const priorityOptions = [
    { value: 'low', label: t('priority.low') },
    { value: 'medium', label: t('priority.medium') },
    { value: 'high', label: t('priority.high') },
    { value: 'urgent', label: t('priority.urgent') },
  ];
  
  // Status options
  const statusOptions = [
    { value: 'pending', label: t('status.pending') },
    { value: 'in_progress', label: t('status.in_progress') },
    { value: 'completed', label: t('status.completed') },
  ];
  
  // Format date display
  const formatDueDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${formatDate(date)} ${formatTime(date)}`;
  };
  
  // Is view mode
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isCreateMode && t('tasks.create')}
            {isEditMode && t('tasks.edit')}
            {isViewMode && t('tasks.details')}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <Icons.X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="modal-content">
          {error && (
            <div className="error-message">
              <Icons.ExclamationCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">{t('tasks.title')}</label>
              {isViewMode ? (
                <p className="form-view-value">{formData.title}</p>
              ) : (
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={t('tasks.titlePlaceholder')}
                  required
                  disabled={loading}
                />
              )}
            </div>
            
            {/* Due Date */}
            <div className="form-group">
              <label className="form-label">{t('tasks.dueDate')}</label>
              {isViewMode ? (
                <p className="form-view-value">{formatDueDateDisplay(formData.due_date)}</p>
              ) : (
                <input
                  type="datetime-local"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              )}
            </div>
            
            {/* Priority & Status Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('tasks.priority')}</label>
                {isViewMode ? (
                  <span className={`priority-badge ${formData.priority}`}>
                    {t(`priority.${formData.priority}`)}
                  </span>
                ) : (
                  <div className="button-group">
                    {priorityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`btn-option ${formData.priority === option.value ? 'active' : ''}`}
                        onClick={() => handlePriorityChange(option.value)}
                        disabled={loading}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('tasks.status')}</label>
                {isViewMode ? (
                  <span className={`status-badge ${formData.status}`}>
                    {t(`status.${formData.status}`)}
                  </span>
                ) : (
                  <div className="button-group">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`btn-option ${formData.status === option.value ? 'active' : ''}`}
                        onClick={() => handleStatusChange(option.value)}
                        disabled={loading}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Description */}
            <div className="form-group">
              <label className="form-label">{t('tasks.description')}</label>
              {isViewMode ? (
                <p className="form-view-value description">
                  {formData.description || t('common.noDescription')}
                </p>
              ) : (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder={t('tasks.descriptionPlaceholder')}
                  rows={4}
                  disabled={loading}
                />
              )}
            </div>
            
            {/* Action Buttons */}
            {!isViewMode && (
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? t('common.saving') : t('common.save')}
                </button>
              </div>
            )}
          </form>
          
          {/* View Mode Actions */}
          {isViewMode && (
            <div className="view-actions">
              <button
                className="btn-secondary"
                onClick={() => onSave(task, 'edit')}
              >
                <Icons.Edit className="w-4 h-4" />
                {t('tasks.edit')}
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={loading}
              >
                <Icons.Trash className="w-4 h-4" />
                {t('tasks.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .modal-container {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        
        .modal-close {
          padding: 8px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }
        
        .modal-close:hover {
          background: #f3f4f6;
          color: #1f2937;
        }
        
        .modal-content {
          padding: 24px;
          overflow-y: auto;
        }
        
        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        
        .form-input,
        .form-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        
        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .form-view-value {
          padding: 10px 14px;
          background: #f9fafb;
          border-radius: 8px;
          font-size: 14px;
          color: #1f2937;
          margin: 0;
        }
        
        .form-view-value.description {
          line-height: 1.6;
          white-space: pre-wrap;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .button-group {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: #f3f4f6;
          border-radius: 8px;
        }
        
        .btn-option {
          flex: 1;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-option:hover {
          color: #374151;
        }
        
        .btn-option.active {
          background: white;
          color: #1f2937;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .form-actions,
        .view-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        
        .btn-primary,
        .btn-secondary,
        .btn-danger {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background: #3b82f6;
          color: white;
          border: none;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }
        
        .btn-secondary {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background: #f3f4f6;
        }
        
        .btn-danger {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        
        .btn-danger:hover:not(:disabled) {
          background: #fee2e2;
        }
        
        .btn-primary:disabled,
        .btn-secondary:disabled,
        .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .priority-badge {
          display: inline-flex;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
        }
        
        .priority-badge.low {
          background: #ecfdf5;
          color: #059669;
        }
        
        .priority-badge.medium {
          background: #fffbeb;
          color: #d97706;
        }
        
        .priority-badge.high {
          background: #fef2f2;
          color: #dc2626;
        }
        
        .priority-badge.urgent {
          background: #fef2f2;
          color: #991b1b;
        }
        
        .status-badge {
          display: inline-flex;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
        }
        
        .status-badge.pending {
          background: #f3f4f6;
          color: #6b7280;
        }
        
        .status-badge.in_progress {
          background: #eff6ff;
          color: #1d4ed8;
        }
        
        .status-badge.completed {
          background: #ecfdf5;
          color: #059669;
        }
      `}</style>
    </div>
  );
};

export default TaskModal;
