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
import { eventBus, TaskEvents, TaskEventData } from '../../../utils/eventBus';

interface ProjectsSectionProps {
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
 * Fetch projects from API
 */
const fetchProjects = async (): Promise<ProjectItemData[]> => {
  const response = await fetch('/api/projects', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  const data = await response.json();
  return data.data || data;
};

/**
 * Toggle project favorite
 */
const toggleFavorite = async (projectId: number): Promise<ProjectItemData> => {
  const response = await fetch(`/api/projects/${projectId}/favorite`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
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
const createProject = async (project: { name: string; color: string; icon: string }): Promise<ProjectItemData> => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
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

  // Fetch projects on mount
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Save collapsed state when it changes
  useEffect(() => {
    saveCollapsedState('nav_favorites_expanded', favoritesExpanded);
  }, [favoritesExpanded]);

  useEffect(() => {
    saveCollapsedState('nav_all_projects_expanded', allProjectsExpanded);
  }, [allProjectsExpanded]);

  // Listen for task events to refresh counts
  useEffect(() => {
    const handleTaskCreated = (data: unknown) => {
      const taskData = data as TaskEventData;
      // Refresh counts for affected project
      if (taskData.project_id) {
        setRefreshing(true);
        loadProjects().finally(() => setRefreshing(false));
      }
    };

    const handleTaskDeleted = (data: unknown) => {
      const taskData = data as TaskEventData;
      // Refresh counts for affected project
      if (taskData.project_id) {
        setRefreshing(true);
        loadProjects().finally(() => setRefreshing(false));
      }
    };

    const handleTaskCompleted = (data: unknown) => {
      const taskData = data as TaskEventData;
      // Refresh counts for affected project
      if (taskData.project_id) {
        setRefreshing(true);
        loadProjects().finally(() => setRefreshing(false));
      }
    };

    const handleRefreshCounts = () => {
      setRefreshing(true);
      loadProjects().finally(() => setRefreshing(false));
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
  }, [loadProjects]);

  // Get favorites and non-favorites
  const favorites = projects.filter((p) => p.is_favorite);
  const nonFavorites = projects.filter((p) => !p.is_favorite);

  // Handle project click
  const handleProjectClick = useCallback((project: ProjectItemData) => {
    setActiveProjectId(project.id);
    onNavigate({
      type: 'project',
      id: `project-${project.id}`,
      params: { project_id: project.id },
    });
  }, [onNavigate]);

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(async (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic update
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, is_favorite: !p.is_favorite } : p
      )
    );

    try {
      await toggleFavorite(projectId);
    } catch (err) {
      // Revert on error
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, is_favorite: !p.is_favorite } : p
        )
      );
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
    }
  }, []);

  // Handle add project
  const handleAddProject = useCallback(async (project: { name: string; color: string; icon: string }) => {
    try {
      const newProject = await createProject(project);
      setProjects((prev) => [...prev, newProject]);
      setAddModalOpen(false);
    } catch (err) {
      throw err; // Let the modal handle the error
    }
  }, []);

  // Section header component
  const SectionHeader: React.FC<{
    title: string;
    icon: React.ReactNode;
    expanded: boolean;
    onToggle: () => void;
    count?: number;
  }> = ({ title, icon, expanded, onToggle, count }) => (
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
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onToggle()}
    >
      <Box sx={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
        <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
      </Box>
      {icon}
      {!collapsed && (
        <>
          <Typography variant="body2" sx={{ flex: 1, ml: 0.5, fontWeight: 500 }}>
            {title}
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
  if (error && projects.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ fontSize: 12 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <Box sx={{ px: collapsed ? 1 : 2, py: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          {collapsed ? 'No projects' : 'Create your first project'}
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
            Create Project
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
    <Box>
      {/* Favorites Section */}
      {favorites.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <SectionHeader
            title="Favorites"
            icon={<StarIcon sx={{ fontSize: 16, color: '#f59e0b', ml: 0.5 }} />}
            expanded={favoritesExpanded}
            onToggle={() => setFavoritesExpanded(!favoritesExpanded)}
            count={favorites.length}
          />
          <Collapse in={favoritesExpanded}>
            <Box sx={{ pl: collapsed ? 0 : 2 }}>
              {favorites.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  collapsed={collapsed}
                  active={activeProjectId === project.id}
                  onClick={() => handleProjectClick(project)}
                  onToggleFavorite={(e) => handleToggleFavorite(project.id, e)}
                />
              ))}
            </Box>
          </Collapse>
        </Box>
      )}

      {/* All Projects Section */}
      <Box>
        <SectionHeader
          title="All Projects"
          icon={<FolderIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 0.5 }} />}
          expanded={allProjectsExpanded}
          onToggle={() => setAllProjectsExpanded(!allProjectsExpanded)}
          count={nonFavorites.length}
        />
        <Collapse in={allProjectsExpanded}>
          <Box sx={{ pl: collapsed ? 0 : 2 }}>
            {nonFavorites.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                collapsed={collapsed}
                active={activeProjectId === project.id}
                onClick={() => handleProjectClick(project)}
                onToggleFavorite={(e) => handleToggleFavorite(project.id, e)}
              />
            ))}
          </Box>
        </Collapse>
      </Box>

      {/* Add Project Button */}
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
            Add Project
          </Button>
        </Box>
      )}

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
