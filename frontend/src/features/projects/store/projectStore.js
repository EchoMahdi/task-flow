/**
 * Projects Feature - Store
 * 
 * Centralized project state management using Zustand.
 * Handles projects, project tasks, and project operations.
 * 
 * Features:
 * - Project list management
 * - Project CRUD operations
 * - Project task management
 * - Project statistics
 * - Optimistic updates
 * - Filtering and search
 * 
 * @module features/projects/store
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { projectService } from '../services/projectService.js';
import { ProjectStatus, createDefaultProjectFilter } from '../types/index.js';
import requestCache from '@/utils/requestCache';

/**
 * Project store initial state
 */
const initialState = {
  // Data
  projects: [],
  favorites: [],
  other: [],
  selectedProject: null,
  currentProject: null,
  projectTasks: [],
  projectStatistics: null,
  
  // Filters
  filters: createDefaultProjectFilter(),
  
  // UI State
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

/**
 * Project store
 */
const useProjectStore = create(
  devtools((set, get) => ({
    ...initialState,
    
    // ==================== Fetch Projects ====================
    
    /**
     * Fetch all projects for the current user
     * @returns {Promise<Object>} Projects data
     */
    fetchProjects: async () => {
      set({ isLoading: true, error: null });

      try {
        const data = await projectService.getProjects(get().filters);

        set({
          favorites: data.favorites || [],
          other: data.other || [],
          projects: [...(data.favorites || []), ...(data.other || [])],
          isLoading: false,
        });

        return data;
      } catch (error) {
        set({
          error: error.message || "Failed to fetch projects",
          isLoading: false,
        });
        throw error;
      }
    },

    /**
     * Fetch a single project
     * @param {number|string} id - Project ID
     */
    fetchProject: async (id) => {
      set({ isLoading: true, error: null });

      try {
        const data = await projectService.getProject(id);

        set({
          currentProject: data.project || data.data,
          selectedProject: data.project || data.data,
          isLoading: false,
        });

        return data.project || data.data;
      } catch (error) {
        set({
          error: error.message || "Failed to fetch project",
          isLoading: false,
        });
        throw error;
      }
    },

    // ==================== Project CRUD ====================

    /**
     * Create a new project
     * @param {Object} data - Project data
     */
    createProject: async (data) => {
      set({ isCreating: true, error: null });
      
      try {
        const result = await projectService.createProject(data);
        const newProject = result.project || result.data;

        // Add to the appropriate list (non-favorites by default)
        set((state) => ({
          other: [...state.other, newProject],
          projects: [...state.projects, newProject],
          isCreating: false,
        }));

        return newProject;
      } catch (error) {
        set({ isCreating: false, error: error.message || "Failed to create project" });
        throw error;
      }
    },

    /**
     * Update a project
     * @param {number|string} id - Project ID
     * @param {Object} data - Project data
     */
    updateProject: async (id, data) => {
      const previousFavorites = get().favorites;
      const previousOther = get().other;

      // Optimistic update
      set((state) => ({
        favorites: state.favorites.map((p) =>
          p.id == id ? { ...p, ...data } : p
        ),
        other: state.other.map((p) =>
          p.id == id ? { ...p, ...data } : p
        ),
        projects: state.projects.map((p) =>
          p.id == id ? { ...p, ...data } : p
        ),
        selectedProject: state.selectedProject?.id == id
          ? { ...state.selectedProject, ...data }
          : state.selectedProject,
        currentProject: state.currentProject?.id == id
          ? { ...state.currentProject, ...data }
          : state.currentProject,
        isUpdating: true,
        error: null,
      }));

      try {
        const result = await projectService.updateProject(id, data);
        const updatedProject = result.project || result.data;

        // Update with server response
        set((state) => ({
          favorites: state.favorites.map((p) =>
            p.id == id ? updatedProject : p
          ),
          other: state.other.map((p) =>
            p.id == id ? updatedProject : p
          ),
          projects: state.projects.map((p) =>
            p.id == id ? updatedProject : p
          ),
          selectedProject: state.selectedProject?.id == id
            ? updatedProject
            : state.selectedProject,
          currentProject: state.currentProject?.id == id
            ? updatedProject
            : state.currentProject,
          isUpdating: false,
        }));

        return updatedProject;
      } catch (error) {
        // Revert on error
        set({
          favorites: previousFavorites,
          other: previousOther,
          isUpdating: false,
          error: error.message || "Failed to update project",
        });
        throw error;
      }
    },

    /**
     * Delete a project
     * @param {number|string} id - Project ID
     */
    deleteProject: async (id) => {
      const previousFavorites = get().favorites;
      const previousOther = get().other;

      // Optimistic update
      set((state) => ({
        favorites: state.favorites.filter((p) => p.id != id),
        other: state.other.filter((p) => p.id != id),
        projects: state.projects.filter((p) => p.id != id),
        currentProject: state.currentProject?.id == id ? null : state.currentProject,
        selectedProject: state.selectedProject?.id == id ? null : state.selectedProject,
        isDeleting: true,
        error: null,
      }));

      try {
        const result = await projectService.deleteProject(id);

        // Invalidate task cache since tasks may have been reassigned
        requestCache.invalidateCache("/api/tasks");

        set({ isDeleting: false });

        return result;
      } catch (error) {
        // Revert on error
        set({
          favorites: previousFavorites,
          other: previousOther,
          projects: [...previousFavorites, ...previousOther],
          isDeleting: false,
          error: error.message || "Failed to delete project",
        });
        throw error;
      }
    },

    /**
     * Toggle project favorite status
     * @param {number|string} projectId - Project ID
     * @param {boolean} isFavorite - New favorite status
     */
    toggleFavorite: async (projectId, isFavorite) => {
      const previousFavorites = get().favorites;
      const previousOther = get().other;

      // Optimistic update
      if (isFavorite) {
        // Move from other to favorites
        set((state) => {
          const project = state.other.find((p) => p.id == projectId);
          if (!project) return state;

          return {
            favorites: [...state.favorites, { ...project, is_favorite: true }],
            other: state.other.filter((p) => p.id != projectId),
            projects: state.projects.map((p) =>
              p.id == projectId ? { ...p, is_favorite: true } : p
            ),
          };
        });
      } else {
        // Move from favorites to other
        set((state) => {
          const project = state.favorites.find((p) => p.id == projectId);
          if (!project) return state;

          return {
            favorites: state.favorites.filter((p) => p.id != projectId),
            other: [...state.other, { ...project, is_favorite: false }],
            projects: state.projects.map((p) =>
              p.id == projectId ? { ...p, is_favorite: false } : p
            ),
          };
        });
      }

      try {
        const result = await projectService.updateFavorite(projectId, isFavorite);
        return result;
      } catch (error) {
        // Revert on error
        set({
          favorites: previousFavorites,
          other: previousOther,
          projects: [...previousFavorites, ...previousOther],
          error: error.message || "Failed to update favorite status",
        });
        throw error;
      }
    },

    /**
     * Archive a project
     * @param {number|string} id - Project ID
     */
    archiveProject: async (id) => {
      return get().updateProject(id, { status: ProjectStatus.ARCHIVED });
    },

    /**
     * Restore an archived project
     * @param {number|string} id - Project ID
     */
    restoreProject: async (id) => {
      return get().updateProject(id, { status: ProjectStatus.ACTIVE });
    },

    // ==================== Project Tasks ====================

    /**
     * Fetch tasks for a specific project
     * @param {number|string} projectId - Project ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Tasks data
     */
    fetchProjectTasks: async (projectId, params = {}) => {
      set({ isLoading: true, error: null });

      try {
        const data = await projectService.getProjectTasks(projectId, params);

        set({
          projectTasks: data.data || [],
          isLoading: false,
        });

        return data;
      } catch (error) {
        set({
          error: error.message || "Failed to fetch project tasks",
          isLoading: false,
        });
        throw error;
      }
    },

    /**
     * Fetch project statistics
     * @param {number|string} projectId - Project ID
     * @returns {Promise<Object>} Statistics data
     */
    fetchProjectStatistics: async (projectId) => {
      try {
        const data = await projectService.getProjectStatistics(projectId);

        set({
          projectStatistics: data.statistics,
        });

        return data;
      } catch (error) {
        set({ error: error.message || "Failed to fetch project statistics" });
        throw error;
      }
    },

    // ==================== Filters ====================

    /**
     * Set filters
     * @param {Object} filters - New filters
     */
    setFilters: (filters) => {
      set((state) => ({
        filters: { ...state.filters, ...filters },
      }));
    },

    /**
     * Reset filters
     */
    resetFilters: () => {
      set({ filters: createDefaultProjectFilter() });
    },

    // ==================== Selection ====================

    /**
     * Set selected project
     * @param {Object|null} project - Project object
     */
    setSelectedProject: (project) => {
      set({ selectedProject: project });
    },

    // ==================== Reset ====================

    /**
     * Reset store to initial state
     */
    reset: () => {
      set(initialState);
    },

    /**
     * Clear error
     */
    clearError: () => {
      set({ error: null });
    },

    /**
     * Clear current project
     */
    clearCurrentProject: () => {
      set({
        currentProject: null,
        projectTasks: [],
        projectStatistics: null,
      });
    },
  }), { name: 'project-store' })
);

// ==================== Selectors ====================

/**
 * Selector for all projects
 */
export const useProjects = () => useProjectStore((state) => state.projects);

/**
 * Selector for favorite projects
 */
export const useFavoriteProjects = () => useProjectStore((state) => state.favorites);

/**
 * Selector for other projects
 */
export const useOtherProjects = () => useProjectStore((state) => state.other);

/**
 * Selector for project loading state
 */
export const useProjectLoading = () => useProjectStore((state) => state.isLoading);

/**
 * Selector for project error
 */
export const useProjectError = () => useProjectStore((state) => state.error);

/**
 * Selector for current project
 */
export const useCurrentProject = () => useProjectStore((state) => state.currentProject);

/**
 * Selector for selected project
 */
export const useSelectedProject = () => useProjectStore((state) => state.selectedProject);

/**
 * Selector for project tasks
 */
export const useProjectTasks = () => useProjectStore((state) => state.projectTasks);

/**
 * Selector for project statistics
 */
export const useProjectStatistics = () => useProjectStore((state) => state.projectStatistics);

/**
 * Selector for filters
 */
export const useProjectFilters = () => useProjectStore((state) => state.filters);

/**
 * Selector for project by ID
 * @param {number|string} id - Project ID
 */
export const useProjectById = (id) =>
  useProjectStore((state) => state.projects.find((p) => p.id == id));

/**
 * Get project by ID
 * @param {number|string} id - Project ID
 * @returns {Object|undefined}
 */
const selectProjectById = (id) => (state) =>
  state.projects.find((project) => project.id == id);

/**
 * Get active projects
 * @returns {Object[]}
 */
const selectActiveProjects = () => (state) =>
  state.projects.filter((project) => project.status === ProjectStatus.ACTIVE);

/**
 * Get archived projects
 * @returns {Object[]}
 */
const selectArchivedProjects = () => (state) =>
  state.projects.filter((project) => project.status === ProjectStatus.ARCHIVED);

/**
 * Selector for project actions
 */
export const useProjectActions = () =>
  useProjectStore((state) => ({
    fetchProjects: state.fetchProjects,
    fetchProject: state.fetchProject,
    createProject: state.createProject,
    updateProject: state.updateProject,
    deleteProject: state.deleteProject,
    toggleFavorite: state.toggleFavorite,
    fetchProjectTasks: state.fetchProjectTasks,
    fetchProjectStatistics: state.fetchProjectStatistics,
    archiveProject: state.archiveProject,
    restoreProject: state.restoreProject,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
    setSelectedProject: state.setSelectedProject,
    reset: state.reset,
    clearError: state.clearError,
    clearCurrentProject: state.clearCurrentProject,
  }));

export {
  useProjectStore,
  selectProjectById,
  selectActiveProjects,
  selectArchivedProjects,
};

export default useProjectStore;
