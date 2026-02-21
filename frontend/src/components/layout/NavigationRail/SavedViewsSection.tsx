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
import { useI18nStore } from '@/stores/i18nStore';

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
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
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
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
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
  onNavigate: (navigation: {
    type: string;
    id: string;
    params: Record<string, unknown>;
  }) => void;
}

/**
 * SavedViewsSection Component
 */
const SavedViewsSection: React.FC<SavedViewsSectionProps> = ({
  collapsed,
  onNavigate,
}) => {
  const { t } = useTranslation();

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
        setError(
          err instanceof Error ? err.message : t('Failed to load saved views')
        );
      } finally {
        setLoading(false);
      }
    };
    loadSavedViews();
  }, [t]);

  useEffect(() => {
    saveCollapsedState('nav_saved_views_expanded', expanded);
  }, [expanded]);

  const handleViewClick = useCallback(
    (view: SavedViewItemData) => {
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
    },
    [onNavigate]
  );

  const handleDeleteClick = useCallback((view: SavedViewItemData) => {
    setViewToDelete(view);
    setDeleteDialogOpen(true);
  }, []);

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
      setError(
        err instanceof Error ? err.message : t('Failed to delete saved view')
      );
    }
  }, [viewToDelete, t]);

  // Section header
  const SectionHeader: React.FC<{ count?: number }> = ({ count }) => (
    <Box
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      aria-expanded={expanded}
      aria-label={t('Saved Views')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.75,
        borderRadius: 1,
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <ViewListIcon fontSize="small" />
      {!collapsed && (
        <>
          <Typography variant="subtitle2" sx={{ flex: 1 }} noWrap>
            {t('Saved Views')}
          </Typography>
          {count !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {count}
            </Typography>
          )}
          <ExpandMoreIcon
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 150ms ease',
            }}
          />
        </>
      )}
    </Box>
  );

  // Loading state
  if (loading) {
    return (
      <Box sx={{ px: collapsed ? 0.5 : 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={18} />
        {!collapsed && (
          <Typography variant="body2" color="text.secondary">
            {t('Loading saved views')}
          </Typography>
        )}
      </Box>
    );
  }

  // Error state
  if (error && savedViews.length === 0) {
    return (
      <Box sx={{ px: collapsed ? 0.5 : 1.5, py: 1 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Empty state
  if (savedViews.length === 0) {
    return (
      <Box sx={{ px: collapsed ? 0.5 : 1.5, py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {collapsed ? t('No saved views') : t('No saved views yet')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <SectionHeader count={savedViews.length} />

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
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
        <DialogTitle>{t('Delete Saved View')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('deleteViewConfirm', { name: viewToDelete?.name ?? '' })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('Cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedViewsSection;
