import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
  const handleStatusChange = (event, newStatus) => {
    if (newStatus !== null) {
      setFormData((prev) => ({ ...prev, status: newStatus }));
    }
  };
  
  // Handle priority change
  const handlePriorityChange = (event, newPriority) => {
    if (newPriority !== null) {
      setFormData((prev) => ({ ...prev, priority: newPriority }));
    }
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
  
  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      urgent: 'error'
    };
    return colors[priority] || 'default';
  };
  
  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'default',
      in_progress: 'primary',
      completed: 'success'
    };
    return colors[status] || 'default';
  };
  
  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Typography variant="h6" component="div">
          {isCreateMode && t('tasks.create')}
          {isEditMode && t('tasks.edit')}
          {isViewMode && t('tasks.details')}
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Title */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75, color: 'text.secondary' }}>
              {t('tasks.title')}
            </Typography>
            {isViewMode ? (
              <Typography variant="body1" sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                {formData.title}
              </Typography>
            ) : (
              <TextField
                fullWidth
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={t('tasks.titlePlaceholder')}
                required
                disabled={loading}
                size="small"
              />
            )}
          </Box>
          
          {/* Due Date */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75, color: 'text.secondary' }}>
              {t('tasks.dueDate')}
            </Typography>
            {isViewMode ? (
              <Typography variant="body1" sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                {formatDueDateDisplay(formData.due_date)}
              </Typography>
            ) : (
              <TextField
                fullWidth
                type="datetime-local"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                disabled={loading}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Box>
          
          {/* Priority & Status Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75, color: 'text.secondary' }}>
                {t('tasks.priority')}
              </Typography>
              {isViewMode ? (
                <Chip 
                  label={t(`priority.${formData.priority}`)}
                  color={getPriorityColor(formData.priority)}
                  size="small"
                />
              ) : (
                <ToggleButtonGroup
                  value={formData.priority}
                  exclusive
                  onChange={handlePriorityChange}
                  aria-label="priority"
                  fullWidth
                  size="small"
                  disabled={loading}
                >
                  {priorityOptions.map((option) => (
                    <ToggleButton key={option.value} value={option.value} aria-label={option.label}>
                      {option.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
            </Box>
            
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75, color: 'text.secondary' }}>
                {t('tasks.status')}
              </Typography>
              {isViewMode ? (
                <Chip 
                  label={t(`status.${formData.status}`)}
                  color={getStatusColor(formData.status)}
                  size="small"
                />
              ) : (
                <ToggleButtonGroup
                  value={formData.status}
                  exclusive
                  onChange={handleStatusChange}
                  aria-label="status"
                  fullWidth
                  size="small"
                  disabled={loading}
                >
                  {statusOptions.map((option) => (
                    <ToggleButton key={option.value} value={option.value} aria-label={option.label}>
                      {option.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
            </Box>
          </Box>
          
          {/* Description */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75, color: 'text.secondary' }}>
              {t('tasks.description')}
            </Typography>
            {isViewMode ? (
              <Typography 
                variant="body1" 
                sx={{ 
                  p: 1.5, 
                  bgcolor: 'action.hover', 
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6
                }}
              >
                {formData.description || t('common.noDescription')}
              </Typography>
            ) : (
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('tasks.descriptionPlaceholder')}
                disabled={loading}
                size="small"
              />
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        {isViewMode ? (
          <>
            <Button
              variant="outlined"
              startIcon={<Icons.Edit />}
              onClick={() => onSave(task, 'edit')}
            >
              {t('tasks.edit')}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Icons.Trash />}
              onClick={handleDelete}
              disabled={loading}
            >
              {t('tasks.delete')}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="text"
              onClick={onClose}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? t('common.saving') : t('common.save')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal;
