/**
 * ============================================================================
 * TaskPreviewDialog Component
 *
 * Read-only preview dialog for task forms.
 * Reuses TaskDetailPanel styling and layout.
 * ============================================================================
 */

import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { taskConfig } from './config';
import { useTranslation } from '@/context/I18nContext';

/**
 * TaskPreviewDialog Component
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether dialog is open
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.taskData - Task form data to preview
 * @param {Object} props.tags - Available tags for display
 * @param {Function} props.onEdit - Edit button callback (optional)
 */
export const TaskPreviewDialog = ({
  open,
  onClose,
  taskData,
  tags = [],
  onEdit,
}) => {
  const { t } = useTranslation();
  const focusRef = useRef(null);

  // Focus first element when dialog opens
  useEffect(() => {
    if (open && focusRef.current) {
      focusRef.current.focus();
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Get priority config
  const priorityInfo =
    taskConfig.priorityConfig[taskData?.priority] ||
    taskConfig.priorityConfig.medium;

  // Get status config
  const statusInfo =
    taskConfig.statusConfig[taskData?.status] ||
    taskConfig.statusConfig.pending;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return t('Not set');
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get tag objects from selected tag IDs
  const selectedTags = (taskData?.selectedTags || []).map((tagId) => {
    const tag = tags.find((t) => t.id === tagId);
    return tag || { id: tagId, name: tagId, color: '#9e9e9e' };
  });

  // Trap focus within dialog
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusableElements = e.currentTarget.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  if (!taskData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle ref={focusRef} tabIndex={-1}>
        {t('Task Preview')}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Title */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {t('Title')}
            </Typography>
            <Typography variant="h6">
              {taskData.title || t('Untitled Task')}
            </Typography>
          </Box>

          <Divider />

          {/* Description */}
          {taskData.description && (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t('Description')}
              </Typography>
              <Typography variant="body2">{taskData.description}</Typography>
            </Box>
          )}

          {/* Priority & Status */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t('Priority')}
              </Typography>
              <Chip
                size="small"
                label={t(priorityInfo.label)}
                sx={{ bgcolor: priorityInfo.bgColor, color: priorityInfo.color }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t('Status')}
              </Typography>
              <Chip
                size="small"
                label={t(statusInfo.label)}
                sx={{ bgcolor: statusInfo.bgColor, color: statusInfo.color }}
              />
            </Box>
          </Box>

          <Divider />

          {/* Due Date */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {t('Due Date')}
            </Typography>
            <Typography variant="body2">
              {formatDate(taskData.dueDate)}
              {taskData.dueTime && (
                <Typography component="span" variant="body2" color="text.secondary">
                  {' '}{t('at')} {taskData.dueTime}
                </Typography>
              )}
            </Typography>
          </Box>

          {/* Tags */}
          {selectedTags.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t('Tags')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {selectedTags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    size="small"
                    sx={{ bgcolor: tag.color + '22', color: tag.color }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Notes */}
          {taskData.notes && (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t('Additional Notes')}
              </Typography>
              <Typography variant="body2">{taskData.notes}</Typography>
            </Box>
          )}

        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          {t('Close')}
        </Button>
        {onEdit && (
          <Button
            onClick={() => {
              onClose();
              onEdit();
            }}
            variant="contained"
            startIcon={<EditIcon />}
          >
            {t('Edit Task')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

TaskPreviewDialog.displayName = 'TaskPreviewDialog';
export default TaskPreviewDialog;
