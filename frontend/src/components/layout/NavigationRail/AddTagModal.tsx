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
import LoadingButton from '@/components/ui/LoadingButton';
import { useI18nStore } from '@/stores/i18nStore';

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
const AddTagModal: React.FC<AddTagModalProps> = ({ open, onClose, onSubmit }) => {
  const t = useI18nStore((state) => state.t);

  const [name, setName]       = useState('');
  const [color, setColor]     = useState(TAG_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('Tag name is required'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), color });
      setName('');
      setColor(TAG_COLORS[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Failed to create tag'));
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
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('Create New Tag')}</DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>

          {/* Error message */}
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          {/* Tag Name */}
          <TextField
            label={t('Tag Name')}
            placeholder={t('Enter tag name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            disabled={loading}
            error={error?.includes('name') ?? false}
            helperText={error?.includes('name') ? error : undefined}
            fullWidth
            autoFocus
          />

          {/* Color Picker */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            {t('Color')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {TAG_COLORS.map((c) => (
              <Box
                key={c}
                component="button"
                type="button"
                onClick={() => setColor(c)}
                aria-label={t('selectColor', { color: c })}
                aria-pressed={color === c}
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
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            {t('Preview')}
          </Typography>
          <Box>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '9999px',
                backgroundColor: color + '22',
                color: color,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              <LabelIcon sx={{ fontSize: 14 }} />
              {name || t('Tag Name')}
            </Box>
          </Box>

        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t('Cancel')}
        </Button>
        <LoadingButton
          onClick={handleSubmit}
          loading={loading}
          variant="contained"
          type="submit"
        >
          {t('Create Tag')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddTagModal;
