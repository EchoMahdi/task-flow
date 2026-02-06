/**
 * ============================================================================
 * SavedViewsSection Component
 * Collapsible saved views section with delete functionality
 * ============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Collapse,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ViewListIcon from '@mui/icons-material/ViewList';
import SavedViewItem, { SavedViewItemData } from './SavedViewItem';

/**
 * Load collapsed state from localStorage
 */
const loadCollapsedState = (key: string, defaultValue: boolean): boolean => {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? defaultValue : stored === 'true';
  } catch {
    return defaultValue;
  }
};

/**
 * Save collapsed state to localStorage
 */
const saveCollapsedState = (key: string, value: boolean): void => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Ignore localStorage errors
  }
};

/**
 * Fetch saved views from API
 */
const fetchSavedViews = async (): Promise<SavedViewItemData[]> => {
  const response = await fetch('/api/saved-views', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch saved views');
  }

  const data = await response.json();
  return data.data || data;
};

/**
 * Delete saved view
 */
const deleteSavedView = async (viewId: number): Promise<void> => {
  const response = await fetch(`/api/saved-views/${viewId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete saved view');
  }
};

interface SavedViewsSectionProps {
  collapsed: boolean;
  onNavigate: (navigation: { type: string; id: string; params: Record<string, unknown> }) => void;
}

/**
 * SavedViewsSection Component
 */
const SavedViewsSection: React.FC<SavedViewsSectionProps> = ({
  collapsed,
  onNavigate,
}) => {
  const [savedViews, setSavedViews] = useState<SavedViewItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(() =>
    loadCollapsedState('nav_saved_views_expanded', false)
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewToDelete, setViewToDelete] = useState<SavedViewItemData | null>(null);
  const [activeViewId, setActiveViewId] = useState<number | null>(null);

  // Fetch saved views on mount
  useEffect(() => {
    const loadSavedViews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSavedViews();
        setSavedViews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load saved views');
      } finally {
        setLoading(false);
      }
    };

    loadSavedViews();
  }, []);

  // Save collapsed state when it changes
  useEffect(() => {
    saveCollapsedState('nav_saved_views_expanded', expanded);
  }, [expanded]);

  // Handle view click
  const handleViewClick = useCallback((view: SavedViewItemData) => {
    setActiveViewId(view.id);
    onNavigate({
      type: 'saved-view',
      id: `saved-view-${view.id}`,
      params: {
        ...view.filter_conditions,
        sort_order: view.sort_order,
        display_mode: view.display_mode,
      },
    });
  }, [onNavigate]);

  // Handle delete click
  const handleDeleteClick = useCallback((view: SavedViewItemData) => {
    setViewToDelete(view);
    setDeleteDialogOpen(true);
  }, []);

  // Handle confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!viewToDelete) return;

    // Optimistic update
    setSavedViews((prev) => prev.filter((v) => v.id !== viewToDelete.id));

    try {
      await deleteSavedView(viewToDelete.id);
      setDeleteDialogOpen(false);
      setViewToDelete(null);
    } catch (err) {
      // Revert on error
      setSavedViews((prev) => [...prev, viewToDelete]);
      setError(err instanceof Error ? err.message : 'Failed to delete saved view');
    }
  }, [viewToDelete]);

  // Section header component
  const SectionHeader: React.FC<{ count?: number }> = ({ count }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: collapsed ? 1 : 0,
        py: 0.5,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
        borderRadius: 1,
      }}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && setExpanded(!expanded)}
    >
      <Box sx={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
        <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
      </Box>
      <ViewListIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 0.5 }} />
      {!collapsed && (
        <>
          <Typography variant="body2" sx={{ flex: 1, ml: 0.5, fontWeight: 500 }}>
            Saved Views
          </Typography>
          {count !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {count}
            </Typography>
          )}
        </>
      )}
    </Box>
  );

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // Error state
  if (error && savedViews.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ fontSize: 12 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (savedViews.length === 0) {
    return (
      <Box sx={{ px: collapsed ? 1 : 2, py: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          {collapsed ? 'No saved views' : 'No saved views yet'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <SectionHeader count={savedViews.length} />
      <Collapse in={expanded}>
        <Box sx={{ pl: collapsed ? 0 : 1 }}>
          {savedViews.map((view) => (
            <SavedViewItem
              key={view.id}
              view={view}
              collapsed={collapsed}
              active={activeViewId === view.id}
              onClick={() => handleViewClick(view)}
              onDelete={() => handleDeleteClick(view)}
            />
          ))}
        </Box>
      </Collapse>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Saved View</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{viewToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedViewsSection;
