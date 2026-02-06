/**
 * ============================================================================
 * AddTagModal Component
 * Modal dialog for creating a new tag
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import LabelIcon from '@mui/icons-material/Label';

/**
 * Available tag colors
 */
const TAG_COLORS = [
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
];

interface AddTagModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tag: { name: string; color: string }) => Promise<void>;
}

/**
 * AddTagModal Component
 */
const AddTagModal: React.FC<AddTagModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Tag name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({ name: name.trim(), color });
      // Reset form on success
      setName('');
      setColor(TAG_COLORS[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setColor(TAG_COLORS[0]);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="add-tag-dialog-title"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="add-tag-dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LabelIcon color="primary" />
            <Typography variant="h6">Create New Tag</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Typography
              color="error"
              variant="body2"
              sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}
            >
              {error}
            </Typography>
          )}
          
          <TextField
            autoFocus
            fullWidth
            label="Tag Name"
            placeholder="Enter tag name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            disabled={loading}
            error={error?.includes('name') ?? false}
          />

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Color
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Select color ${c}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: color === c ? '3px solid #000' : '2px solid transparent',
                  cursor: color === c ? 'default' : 'pointer',
                  opacity: color === c ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </Box>

          {/* Preview */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Preview
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {name || 'Tag Name'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !name.trim()}
          >
            {loading ? 'Creating...' : 'Create Tag'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddTagModal;
