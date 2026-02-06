/**
 * ============================================================================
 * TagsSection Component
 * Collapsible tags section with CRUD operations
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
import AddIcon from '@mui/icons-material/Add';
import LabelIcon from '@mui/icons-material/Label';
import TagItem, { TagItemData } from './TagItem';
import AddTagModal from './AddTagModal';
import { eventBus, TaskEvents, TaskEventData } from '../../../utils/eventBus';

interface TagsSectionProps {
  collapsed: boolean;
  onNavigate: (navigation: { type: string; id: string; params: Record<string, unknown> }) => void;
}

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
 * Fetch tags from API
 */
const fetchTags = async (): Promise<TagItemData[]> => {
  const response = await fetch('/api/tags', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }

  const data = await response.json();
  return data.data || data;
};

/**
 * Create new tag
 */
const createTag = async (tag: { name: string; color: string }): Promise<TagItemData> => {
  const response = await fetch('/api/tags', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tag),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create tag');
  }

  return response.json();
};

/**
 * Delete tag
 */
const deleteTag = async (tagId: number): Promise<void> => {
  const response = await fetch(`/api/tags/${tagId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete tag');
  }
};

/**
 * TagsSection Component
 */
const TagsSection: React.FC<TagsSectionProps> = ({
  collapsed,
  onNavigate,
}): React.ReactNode => {
  const [tags, setTags] = useState<TagItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(() =>
    loadCollapsedState('nav_tags_expanded', false)
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<TagItemData | null>(null);
  const [activeTagId, setActiveTagId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch tags on mount
  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTags();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // Save collapsed state when it changes
  useEffect(() => {
    saveCollapsedState('nav_tags_expanded', expanded);
  }, [expanded]);

  // Listen for task events to refresh counts
  useEffect(() => {
    const handleTaskCreated = (data: unknown) => {
      const taskData = data as TaskEventData;
      // Refresh if new task has tags
      if (taskData.tag_ids && taskData.tag_ids.length > 0) {
        setRefreshing(true);
        loadTags().finally(() => setRefreshing(false));
      }
    };

    const handleTaskDeleted = (data: unknown) => {
      const taskData = data as TaskEventData;
      // Refresh if deleted task had tags
      if (taskData.tag_ids && taskData.tag_ids.length > 0) {
        setRefreshing(true);
        loadTags().finally(() => setRefreshing(false));
      }
    };

    const handleTaskCompleted = (data: unknown) => {
      const taskData = data as TaskEventData;
      // Refresh if completed task had tags
      if (taskData.tag_ids && taskData.tag_ids.length > 0) {
        setRefreshing(true);
        loadTags().finally(() => setRefreshing(false));
      }
    };

    const handleRefreshCounts = () => {
      setRefreshing(true);
      loadTags().finally(() => setRefreshing(false));
    };

    // Subscribe to events
    const unsubscribers = [
      eventBus.on(TaskEvents.TASK_CREATED, handleTaskCreated),
      eventBus.on(TaskEvents.TASK_DELETED, handleTaskDeleted),
      eventBus.on(TaskEvents.TASK_COMPLETED, handleTaskCompleted),
      eventBus.on(TaskEvents.TASK_UNCOMPLETED, handleTaskCompleted),
      eventBus.on(TaskEvents.REFRESH_COUNTS, handleRefreshCounts),
    ];

    // Cleanup
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [loadTags]);

  // Handle tag click
  const handleTagClick = useCallback((tag: TagItemData) => {
    setActiveTagId(tag.id);
    onNavigate({
      type: 'tag',
      id: `tag-${tag.id}`,
      params: { tag_id: tag.id },
    });
  }, [onNavigate]);

  // Handle delete click
  const handleDeleteClick = useCallback((tag: TagItemData) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  }, []);

  // Handle confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!tagToDelete) return;

    // Optimistic update
    setTags((prev) => prev.filter((t) => t.id !== tagToDelete.id));

    try {
      await deleteTag(tagToDelete.id);
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    } catch (err) {
      // Revert on error
      setTags((prev) => [...prev, tagToDelete]);
      setError(err instanceof Error ? err.message : 'Failed to delete tag');
    }
  }, [tagToDelete]);

  // Handle add tag
  const handleAddTag = useCallback(async (tag: { name: string; color: string }) => {
    try {
      const newTag = await createTag(tag);
      setTags((prev) => [...prev, newTag]);
      setAddModalOpen(false);
    } catch (err) {
      throw err; // Let the modal handle the error
    }
  }, []);

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
        opacity: refreshing ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && setExpanded(!expanded)}
    >
      <Box sx={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
        <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
      </Box>
      <LabelIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 0.5 }} />
      {!collapsed && (
        <>
          <Typography variant="body2" sx={{ flex: 1, ml: 0.5, fontWeight: 500 }}>
            Tags
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
  if (error && tags.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ fontSize: 12 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (tags.length === 0) {
    return (
      <Box sx={{ px: collapsed ? 1 : 2, py: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          {collapsed ? 'No tags' : 'No tags yet'}
        </Typography>
        {!collapsed && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setAddModalOpen(true)}
            sx={{ mt: 1 }}
            fullWidth
          >
            Create Tag
          </Button>
        )}
        <AddTagModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddTag}
        />
      </Box>
    );
  }

  return (
    <Box>
      <SectionHeader count={tags.length} />
      <Collapse in={expanded}>
        <Box sx={{ pl: collapsed ? 0 : 1 }}>
          {tags.map((tag) => (
            <TagItem
              key={tag.id}
              tag={tag}
              collapsed={collapsed}
              active={activeTagId === tag.id}
              onClick={() => handleTagClick(tag)}
              onDelete={() => handleDeleteClick(tag)}
            />
          ))}
        </Box>
      </Collapse>

      {/* Add Tag Button */}
      {!collapsed && (
        <Box sx={{ px: 2, mt: 1 }}>
          <Button
            variant="text"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setAddModalOpen(true)}
            fullWidth
            sx={{ justifyContent: 'flex-start' }}
          >
            Add Tag
          </Button>
        </Box>
      )}

      {/* Add Tag Modal */}
      <AddTagModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddTag}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Tag</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{tagToDelete?.name}"? This action cannot be undone.
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

export default TagsSection;
