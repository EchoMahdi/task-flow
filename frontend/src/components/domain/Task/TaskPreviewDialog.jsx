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

/**
 * Priority badge colors
 */
const priorityConfig = {
  high: { color: '#d32f2f', bgColor: '#ffebee', label: 'High Priority' },
  medium: { color: '#f57c00', bgColor: '#fff3e0', label: 'Medium Priority' },
  low: { color: '#388e3c', bgColor: '#e8f5e9', label: 'Low Priority' },
};

/**
 * Status badge colors
 */
const statusConfig = {
  pending: { color: '#757575', bgColor: '#f5f5f5', label: 'Pending' },
  in_progress: { color: '#1976d2', bgColor: '#e3f2fd', label: 'In Progress' },
  completed: { color: '#388e3c', bgColor: '#e8f5e9', label: 'Completed' },
};

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
  const priorityInfo = priorityConfig[taskData?.priority] || priorityConfig.medium;

  // Get status config
  const statusInfo = statusConfig[taskData?.status] || statusConfig.pending;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
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
      maxWidth="sm"
      fullWidth
      aria-labelledby="preview-dialog-title"
      aria-describedby="preview-dialog-description"
      onKeyDown={handleKeyDown}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        id="preview-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2,
        }}
      >
        <Typography variant="h6" component="div">
          Task Preview
        </Typography>
        <Button
          ref={focusRef}
          onClick={onClose}
          aria-label="Close preview"
          sx={{ minWidth: 'auto', p: 1 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
            >
              Title
            </Typography>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {taskData.title || 'Untitled Task'}
            </Typography>
          </Box>

          {taskData.description && (
            <Box>
              <Typography
                variant="overline"
                sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
              >
                Description
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  bgcolor: 'action.hover',
                  p: 2,
                  borderRadius: 1,
                }}
              >
                {taskData.description}
              </Typography>
            </Box>
          )}

          <Divider />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={statusInfo.label}
              sx={{
                bgcolor: statusInfo.bgColor,
                color: statusInfo.color,
                fontWeight: 500,
              }}
            />
            <Chip
              label={priorityInfo.label}
              sx={{
                bgcolor: priorityInfo.bgColor,
                color: priorityInfo.color,
                fontWeight: 500,
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
            >
              Due Date
            </Typography>
            <Typography variant="body1">
              {formatDate(taskData.dueDate)}
              {taskData.dueTime && (
                <Typography component="span" sx={{ color: 'text.secondary', ml: 1 }}>
                  at {taskData.dueTime}
                </Typography>
              )}
            </Typography>
          </Box>

          {selectedTags.length > 0 && (
            <Box>
              <Typography
                variant="overline"
                sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 1 }}
              >
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedTags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    size="small"
                    sx={{
                      bgcolor: `${tag.color}20`,
                      color: tag.color,
                      border: `1px solid ${tag.color}`,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {taskData.notes && (
            <Box>
              <Typography
                variant="overline"
                sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
              >
                Additional Notes
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  color: 'text.secondary',
                  fontStyle: 'italic',
                }}
              >
                {taskData.notes}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          px: 3,
          py: 2,
        }}
      >
        <Button onClick={onClose} variant="text">
          Close
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
            Edit Task
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

TaskPreviewDialog.displayName = 'TaskPreviewDialog';

export default TaskPreviewDialog;
