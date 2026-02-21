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
import { eventBus, TaskEvents, TaskEventData } from '@/utils/eventBus';
import { useI18nStore } from '@/stores/i18nStore';

interface TagsSectionProps {
  collapsed: boolean;
  onNavigate: (navigation: {
    type: string;
    id: string;
    params: Record<string, unknown>;
  }) => void;
}

const loadCollapsedState = (key: string, defaultValue: boolean): boolean => {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? defaultValue : stored === 'true';
  } catch {
    return defaultValue;
  }
};

const saveCollapsedState = (key: string, value: boolean): void => {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
};

const fetchTags = async (): Promise<TagItemData[]> => {
  const response = await fetch('/api/tags', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch tags');
  const data = await response.json();
  return data.data || data;
};

const createTag = async (tag: { name: string; color: string }): Promise<TagItemData> => {
  const response = await fetch('/api/tags', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
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

const deleteTag = async (tagId: number): Promise<void> => {
  const response = await fetch(`/api/tags/${tagId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
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
  const { t } = useTranslation();

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

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTags();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Failed to load tags'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { loadTags(); }, [loadTags]);

  useEffect(() => {
    saveCollapsedState('nav_tags_expanded', expanded);
  }, [expanded]);

  // Listen for task events to update counts locally
  useEffect(() => {
    const handleTaskCreated = (data: unknown) => {
      const taskData = data as TaskEventData;
      if (taskData.tag_ids?.length > 0) {
        setTags((prev) =>
          prev.map((t) =>
            taskData.tag_ids.includes(t.id)
              ? { ...t, task_count: (t.task_count || 0) + 1 }
              : t
          )
        );
      }
    };

    const handleTaskDeleted = (data: unknown) => {
      const taskData = data as TaskEventData;
      if (taskData.tag_ids?.length > 0) {
        setTags((prev) =>
          prev.map((t) =>
            taskData.tag_ids.includes(t.id)
              ? { ...t, task_count: Math.max(0, (t.task_count || 0) - 1) }
              : t
          )
        );
      }
    };

    const handleTaskCompleted = (data: unknown) => {
      const taskData = data as TaskEventData;
      if (taskData.tag_ids?.length > 0) {
        setTags((prev) =>
          prev.map((t) =>
            taskData.tag_ids.includes(t.id)
              ? { ...t, task_count: Math.max(0, (t.task_count || 0) - 1) }
              : t
          )
        );
      }
    };

    const handleRefreshCounts = () => {
      setRefreshing(true);
      loadTags().finally(() => setRefreshing(false));
    };

    const unsubscribers = [
      eventBus.on(TaskEvents.TASK_CREATED, handleTaskCreated),
      eventBus.on(TaskEvents.TASK_DELETED, handleTaskDeleted),
      eventBus.on(TaskEvents.TASK_COMPLETED, handleTaskCompleted),
      eventBus.on(TaskEvents.TASK_UNCOMPLETED, handleTaskCompleted),
      eventBus.on(TaskEvents.REFRESH_COUNTS, handleRefreshCounts),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [loadTags]);

  const handleTagClick = useCallback(
    (tag: TagItemData) => {
      setActiveTagId(tag.id);
      onNavigate({ type: 'tag', id: `tag-${tag.id}`, params: { tag_id: tag.id } });
    },
    [onNavigate]
  );

  const handleDeleteClick = useCallback((tag: TagItemData) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!tagToDelete) return;
    setTags((prev) => prev.filter((t) => t.id !== tagToDelete.id));
    try {
      await deleteTag(tagToDelete.id);
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    } catch (err) {
      setTags((prev) => [...prev, tagToDelete]);
      setError(err instanceof Error ? err.message : t('Failed to delete tag'));
    }
  }, [tagToDelete, t]);

  const handleAddTag = useCallback(async (tag: { name: string; color: string }) => {
    const newTag = await createTag(tag);
    setTags((prev) => [...prev, newTag]);
    setAddModalOpen(false);
  }, []);

  // Section header
  const SectionHeader: React.FC<{ count?: number }> = ({ count }) => (
    <Box
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      aria-expanded={expanded}
      aria-label={t('Tags')}
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
      <LabelIcon fontSize="small" />
      {!collapsed && (
        <>
          <Typography variant="subtitle2" sx={{ flex: 1 }} noWrap>
            {t('Tags')}
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
            {t('Loading tags')}
          </Typography>
        )}
      </Box>
    );
  }

  // Error state
  if (error && tags.length === 0) {
    return (
      <Box sx={{ px: collapsed ? 0.5 : 1.5, py: 1 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Empty state
  if (tags.length === 0) {
    return (
      <Box sx={{ px: collapsed ? 0.5 : 1.5, py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {collapsed ? t('No tags') : t('No tags yet')}
        </Typography>
        {!collapsed && (
          <Button
            variant="contained"
            onClick={() => setAddModalOpen(true)}
            sx={{ mt: 1 }}
            fullWidth
            startIcon={<AddIcon />}
          >
            {t('Create Tag')}
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

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
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

        {/* Add Tag Button */}
        {!collapsed && (
          <Button
            onClick={() => setAddModalOpen(true)}
            fullWidth
            sx={{ justifyContent: 'flex-start', mt: 0.5 }}
            startIcon={<AddIcon />}
          >
            {t('Add Tag')}
          </Button>
        )}
      </Collapse>

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
        <DialogTitle>{t('Delete Tag')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('deleteTagConfirm', { name: tagToDelete?.name ?? '' })}
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

export default TagsSection;
