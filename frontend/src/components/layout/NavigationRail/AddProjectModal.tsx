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
  { name: 'Folder', value: 'folder' },
  { name: 'Star', value: 'star' },
  { name: 'Heart', value: 'heart' },
  { name: 'Work', value: 'work' },
  { name: 'Home', value: 'home' },
  { name: 'Code', value: 'code' },
  { name: 'Book', value: 'book' },
  { name: 'Plane', value: 'plane' },
  { name: 'Music', value: 'music' },
  { name: 'Game', value: 'game' },
];

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
  console.log('[AddProjectModal] Rendering, open:', open);
  console.log('[AddProjectModal] Modal DOM structure check');
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [icon, setIcon] = useState(PROJECT_ICONS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Project name is required');
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
      setError(err instanceof Error ? err.message : 'Failed to create project');
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
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="add-project-dialog-title"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="add-project-dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon color="primary" />
            <Typography variant="h6">Create New Project</Typography>
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
            label="Project Name"
            placeholder="Enter project name"
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
            {PROJECT_COLORS.map((c) => (
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

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Icon
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {PROJECT_ICONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setIcon(item.value)}
                aria-label={`Select icon ${item.name}`}
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
                {item.value === 'folder' && '📁'}
                {item.value === 'star' && '⭐'}
                {item.value === 'heart' && '❤️'}
                {item.value === 'work' && '💼'}
                {item.value === 'home' && '🏠'}
                {item.value === 'code' && '💻'}
                {item.value === 'book' && '📚'}
                {item.value === 'plane' && '✈️'}
                {item.value === 'music' && '🎵'}
                {item.value === 'game' && '🎮'}
              </button>
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
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              {icon === 'folder' && '📁'}
              {icon === 'star' && '⭐'}
              {icon === 'heart' && '❤️'}
              {icon === 'work' && '💼'}
              {icon === 'home' && '🏠'}
              {icon === 'code' && '💻'}
              {icon === 'book' && '📚'}
              {icon === 'plane' && '✈️'}
              {icon === 'music' && '🎵'}
              {icon === 'game' && '🎮'}
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Preview
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {name || 'Project Name'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            loading={loading}
            loadingText="Creating..."
            disabled={!name.trim() || loading}
          >
            Create Project
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddProjectModal;
