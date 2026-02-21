/**
 * ============================================================================
 * ProjectsSection Component
 * Collapsible projects section with favorites and all projects
 * ============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import FolderIcon from '@mui/icons-material/Folder';
import ProjectItem, { ProjectItemData } from './ProjectItem';
import AddProjectModal from './AddProjectModal';
import { eventBus, TaskEvents, TaskEventData } from '@/utils/eventBus';
import { useI18nStore } from '@/stores/i18nStore';

interface ProjectsSectionProps {
  collapsed: boolean;
  onNavigate: (navigation: {
    type: string;
    id: string;
    params: Record<string, unknown>;
  }) => void;
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
 * Fetch projects from API
 */
const fetchProjects = async (): Promise<ProjectItemData[]> => {
  const response = await fetch('/api/projects', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  const data = await response.json();
  const projects = Array.isArray(data) ? data : (data.data || []);
  return projects;
};

/**
 * Toggle project favorite
 */
const toggleFavorite = async (projectId: number): Promise<unknown> => {
  const response = await fetch(`/api/projects/${projectId}/favorite`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to toggle favorite');
  }

  return response.json();
};

/**
 * Create new project
 */
const createProject = async (project: {
  name: string;
  color: string;
  icon: string;
}): Promise<ProjectItemData> => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(project),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create project');
  }

  return response.json();
};

/**
 * ProjectsSection Component
 */
const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  collapsed,
  onNavigate,
}): React.ReactNode => {
  const { t } = useTranslation();

  const [projects, setProjects] = useState<ProjectItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [favoritesExpanded, setFavoritesExpanded] = useState(() =>
    loadCollapsedState('nav_favorites_expanded', true)
  );

  const [allProjectsExpanded, setAllProjectsExpanded] = useState(() =>
    loadCollapsedState('nav_all_projects_expanded', true)
  );

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Failed to load projects'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    saveCollapsedState('nav_favorites_expanded', favoritesExpanded);
  }, [favoritesExpanded]);

  useEffect(() => {
    saveCollapsedState('nav_all_projects_expanded', allProjectsExpanded);
  }, [allProjectsExpanded]);

  // Listen for task events to update counts locally (no full refetch)
  useEffect(() => {
    const handleTaskCreated = (data: unknown) => {
      const taskData = data as TaskEventData;
      if (taskData.project_id) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === taskData.project_id
              ? { ...p, task_count: (p.task_count || 0) + 1 }
              : p
          )
        );
      }
    };

    const handleTaskDeleted = (data: unknown) => {
      const taskData = data as TaskEventData;
      if (taskData.project_id) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === taskData.project_id
              ? { ...p, task_count: Math.max(0, (p.task_count || 0) - 1) }
              : p
          )
        );
      }
    };

    const handleTaskCompleted = (data: unknown) => {
      const taskData = data as TaskEventData;
      if (taskData.project_id) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === taskData.project_id
              ? { ...p, task_count: Math.max(0, (p.task_count || 0) - 1) }
              : p
          )
        );
      }
    };

    const handleRefreshCounts = () => {
      setRefreshing(true);
      loadProjects().finally(() => setRefreshing(false));
    };

    const unsubscribers = [
      eventBus.on(TaskEvents.TASK_CREATED, handleTaskCreated),
      eventBus.on(TaskEvents.TASK_DELETED, handleTaskDeleted),
      eventBus.on(TaskEvents.TASK_COMPLETED, handleTaskCompleted),
      eventBus.on(TaskEvents.TASK_UNCOMPLETED, handleTaskCompleted),
      eventBus.on(TaskEvents.REFRESH_COUNTS, handleRefreshCounts),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [loadProjects]);

  const favorites = projects.filter((p) => p.is_favorite);
  const nonFavorites = projects.filter((p) => !p.is_favorite);

  const handleProjectClick = useCallback(
    (project: ProjectItemData) => {
      setActiveProjectId(project.id);
      onNavigate({
        type: 'project',
        id: `project-${project.id}`,
        params: { project_id: project.id },
      });
    },
    [onNavigate]
  );

  const handleToggleFavorite = useCallback(async (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    // optimistic update
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, is_favorite: !p.is_favorite } : p))
    );

    try {
      await toggleFavorite(projectId);
    } catch (err) {
      // revert on error
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, is_favorite: !p.is_favorite } : p))
      );
      setError(err instanceof Error ? err.message : t('Failed to update favorite'));
    }
  }, [t]);

  const handleAddProject = useCallback(async (project: { name: string; color: string; icon: string }) => {
    try {
      const newProject = await createProject(project);
      setProjects((prev) => [...prev, newProject]);
      setAddModalOpen(false);
    } catch (err) {
      // Let the modal handle the error message
      throw err;
    }
  }, []);

  const SectionHeader: React.FC<{
    title: string;
    icon: React.ReactNode;
    expanded: boolean;
    onToggle: () => void;
    count?: number;
  }> = ({ title, icon, expanded, onToggle, count }) => (
    <Box
      onClick={onToggle}
      onKeyDown={(e) => e.key === 'Enter' && onToggle()}
      role="button"
      tabIndex={0}
      aria-label={title}
      aria-expanded={expanded}
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
      {icon}
      {!collapsed && (
        <>
          <Typography variant="subtitle2" sx={{ flex: 1 }} noWrap>
            {title}
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
      <Box sx={{ px: collapsed ? 0.5 : 1.5, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={18} />
          {!collapsed && (
            <Typography variant="body2" color="text.secondary">
              {t('Loading projects')}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  // Error state
  if (error && projects.length === 0) {
    return (
      <Box sx={{ px: collapsed ? 0.5 : 1.5, py: 1 }}>
        <Alert severity="error">{t(error)}</Alert>
      </Box>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <Box sx={{ px: collapsed ? 0.5 : 1.5, py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {collapsed ? t('No projects') : t('Create your first project')}
        </Typography>

        {!collapsed && (
          <Button
            variant="contained"
            onClick={() => setAddModalOpen(true)}
            sx={{ mt: 1 }}
            fullWidth
            startIcon={<AddIcon />}
          >
            {t('Create Project')}
          </Button>
        )}

        <AddProjectModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddProject}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ px: collapsed ? 0.5 : 0 }}>
      {/* Favorites */}
      {favorites.length > 0 && (
        <Box>
          <SectionHeader
            title={t('Favorites')}
            icon={<StarIcon fontSize="small" />}
            expanded={favoritesExpanded}
            onToggle={() => setFavoritesExpanded(!favoritesExpanded)}
            count={favorites.length}
          />

          <Collapse in={favoritesExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
              {favorites.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  collapsed={collapsed}
                  onClick={() => handleProjectClick(project)}
                  onToggleFavorite={(e) => handleToggleFavorite(project.id, e)}
                />
              ))}
            </Box>
          </Collapse>
        </Box>
      )}

      {/* All Projects */}
      <Box sx={{ mt: favorites.length > 0 ? 1 : 0 }}>
        <SectionHeader
          title={t('Projects')}
          icon={<FolderIcon fontSize="small" />}
          expanded={allProjectsExpanded}
          onToggle={() => setAllProjectsExpanded(!allProjectsExpanded)}
          count={nonFavorites.length}
        />

        <Collapse in={allProjectsExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
            {nonFavorites.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                collapsed={collapsed}
                onClick={() => handleProjectClick(project)}
                onToggleFavorite={(e) => handleToggleFavorite(project.id, e)}
              />
            ))}
          </Box>

          {/* Add Project Button */}
          {!collapsed && (
            <Button
              onClick={() => setAddModalOpen(true)}
              fullWidth
              sx={{ justifyContent: 'flex-start', mt: 0.5 }}
              startIcon={<AddIcon />}
            >
              {t('Add Project')}
            </Button>
          )}
        </Collapse>
      </Box>

      {/* Add Project Modal */}
      <AddProjectModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddProject}
      />
    </Box>
  );
};

export default ProjectsSection;
