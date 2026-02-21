/**
 * ============================================================================
 * AddProjectModal Component
 * Modal dialog for creating a new project
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
import FolderIcon from '@mui/icons-material/Folder';
import LoadingButton from '@/components/ui/LoadingButton';
import { useI18nStore } from '@/stores/i18nStore';

/**
 * Available project colors
 */
const PROJECT_COLORS = [
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

/**
 * Available project icons (as emoji for simplicity)
 */
const PROJECT_ICONS = [
  { name: 'Folder', value: 'folder', emoji: '📁' },
  { name: 'Star',   value: 'star',   emoji: '⭐' },
  { name: 'Heart',  value: 'heart',  emoji: '❤️' },
  { name: 'Work',   value: 'work',   emoji: '💼' },
  { name: 'Home',   value: 'home',   emoji: '🏠' },
  { name: 'Code',   value: 'code',   emoji: '💻' },
  { name: 'Book',   value: 'book',   emoji: '📚' },
  { name: 'Plane',  value: 'plane',  emoji: '✈️' },
  { name: 'Music',  value: 'music',  emoji: '🎵' },
  { name: 'Game',   value: 'game',   emoji: '🎮' },
];

// Helper: get emoji by icon value
const getEmoji = (value: string): string =>
  PROJECT_ICONS.find((i) => i.value === value)?.emoji ?? '📁';

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (project: { name: string; color: string; icon: string }) => Promise<void>;
}

/**
 * AddProjectModal Component
 */
const AddProjectModal: React.FC<AddProjectModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const t = useI18nStore((state) => state.t);

  const [name, setName]       = useState('');
  const [color, setColor]     = useState(PROJECT_COLORS[0]);
  const [icon, setIcon]       = useState(PROJECT_ICONS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('Project name is required'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), color, icon });
      // Reset form on success
      setName('');
      setColor(PROJECT_COLORS[0]);
      setIcon(PROJECT_ICONS[0].value);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('Failed to create project')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setColor(PROJECT_COLORS[0]);
      setIcon(PROJECT_ICONS[0].value);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('Create New Project')}</DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>

          {/* Error message */}
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          {/* Project Name */}
          <TextField
            label={t('Project Name')}
            placeholder={t('Enter project name')}
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
            {PROJECT_COLORS.map((c) => (
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

          {/* Icon Picker */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            {t('Icon')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {PROJECT_ICONS.map((item) => (
              <Box
                key={item.value}
                component="button"
                type="button"
                onClick={() => setIcon(item.value)}
                aria-label={t('selectIcon', { name: t(item.name) })}
                aria-pressed={icon === item.value}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: icon === item.value ? color : 'transparent',
                  border: icon === item.value ? '2px solid #000' : '1px solid #e0e0e0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  transition: 'all 0.2s ease',
                }}
              >
                {item.emoji}
              </Box>
            ))}
          </Box>

          {/* Preview */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            {t('Preview')}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                backgroundColor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              {getEmoji(icon)}
            </Box>
            <Typography variant="body1">
              {name || t('Project Name')}
            </Typography>
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
          {t('Create Project')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddProjectModal;
