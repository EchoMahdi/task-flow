/**
 * Tasks Feature - Store
 * 
 * Centralized task state management using Zustand.
 * Handles tasks, filters, pagination, and task operations.
 * 
 * Features:
 * - Task list management
 * - Filtering and sorting
 * - Pagination
 * - Task CRUD operations
 * - Optimistic updates
 * - Request caching and deduplication
 * - View modes
 * 
 * @module features/tasks/store
 */

import { create } from 'zustand';
import { subscribeWithSelector, useShallow } from 'zustand/middleware';
import { taskService } from '../services/taskService.js';
import {
  TaskStatus,
  TaskPriority,
  createDefaultTaskFilter,
  createDefaultTaskSort,
} from '../types/index.js';
import requestCache from '@/utils/requestCache';
import { taskEventPublisher } from '../events/taskEventPublisher';

// Default cache TTL (30 seconds)
const DEFAULT_CACHE_TTL = 30000;

// In-flight request tracking for deduplication
const pendingRequests = new Map();

// AbortController for canceling in-flight requests
let abortController = null;

/**
 * Task store initial state
 */
const initialState = {
  // Data
  tasks: [],
  selectedTask: null,
  
  // Pagination
  pagination: {
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 0,
  },
  
  // Filters and sorting
  filters: createDefaultTaskFilter(),
  sort: createDefaultTaskSort(),
  
  // Legacy sort fields (for compatibility)
  sortBy: "created_at",
  sortOrder: "desc",
  
  // UI State
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  
  // Selection
  selectedIds: [],
  selectedTasks: [],
  
  // View state
  viewMode: 'list', // 'list' | 'board' | 'calendar'
  
  // Quick add
  quickAddOpen: false,
  
  // Legacy fields for compatibility
  editingTask: null,
};

/**
 * Task store
 */
const useTaskStore = create(
 
    subscribeWithSelector((set, get) => ({
      ...initialState,
      
      // ==================== Fetch Tasks ====================
      
      /**
       * Fetch tasks with current filters
       * @param {Object} [customFilters] - Override filters
       * @param {number} [customPage] - Override page
       * @returns {Promise<Object>} Response data
       */
      fetchTasks: async (customFilters = null, customPage = null) => {
        const { pagination, filters, sort, sortBy, sortOrder } = get();
        const page = customPage ?? pagination.page;
        const currentFilters = customFilters ?? filters;

        // Generate cache key
        const cacheKey = JSON.stringify({
          page,
          per_page: pagination.perPage,
          sortBy: sort.field || sortBy,
          sortOrder: sort.direction || sortOrder,
          ...currentFilters,
        });

        // Check cache first (only for same page/filter combination)
        const cached = requestCache.getCachedResponse(
          "GET",
          "/api/tasks",
          currentFilters,
          DEFAULT_CACHE_TTL,
        );
        if (cached && !customFilters && !customPage) {
          set({
            tasks: cached.data || [],
            pagination: {
              ...pagination,
              page: cached.current_page || page,
              totalPages: cached.last_page || 1,
              total: cached.total || 0,
            },
          });
          return cached;
        }

        // Check for in-flight request (deduplication)
        if (pendingRequests.has(cacheKey)) {
          return pendingRequests.get(cacheKey);
        }

        // Abort previous request
        if (abortController) {
          abortController.abort();
        }

        // Create new AbortController
        abortController = new AbortController();

        set({ isLoading: true, error: null });

        // Update pagination page if customPage was provided
        if (customPage !== null) {
          set((state) => ({
            pagination: { ...state.pagination, page: customPage },
          }));
        }

        // Build API params
        const apiParams = {
          page,
          per_page: pagination.perPage,
          sort_by: sort.field || sortBy,
          sort_order: sort.direction || sortOrder,
        };

        // Merge filters into params
        if (currentFilters.status && currentFilters.status !== "all") {
          apiParams.status = currentFilters.status;
        }
        if (currentFilters.priority && currentFilters.priority !== "all") {
          apiParams.priority = currentFilters.priority;
        }
        if (currentFilters.search) {
          apiParams.search = currentFilters.search;
        }
        if (currentFilters.project_id) {
          apiParams.project_id = currentFilters.project_id;
        }
        if (currentFilters.tag_id) {
          apiParams.tag_id = currentFilters.tag_id;
        }

        const requestPromise = (async () => {
          try {
            const data = await taskService.getTasks(apiParams);

            // Cache response
            requestCache.setCachedResponse(
              "GET",
              "/api/tasks",
              currentFilters,
              data,
            );

            set({
              tasks: data.data || [],
              pagination: {
                ...pagination,
                page: data.current_page || page,
                totalPages: data.last_page || 1,
                total: data.total || 0,
              },
              isLoading: false,
            });

            return data;
          } catch (error) {
            // Ignore abort errors
            if (error.name === "AbortError") {
              return null;
            }

            set({
              error: error.message || "Failed to fetch tasks",
              isLoading: false,
            });
            throw error;
          } finally {
            pendingRequests.delete(cacheKey);
            abortController = null;
          }
        })();

        pendingRequests.set(cacheKey, requestPromise);
        return requestPromise;
      },

      /**
       * Refresh tasks (bypass cache)
       */
      refreshTasks: async () => {
        requestCache.invalidateCache("/api/tasks");
        return get().fetchTasks();
      },

      /**
       * Fetch a single task
       * @param {number|string} id - Task ID
       */
      fetchTask: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await taskService.getTask(id);
          set({ selectedTask: response.data, isLoading: false });
          return response.data;
        } catch (error) {
          set({ isLoading: false, error });
          throw error;
        }
      },

      // ==================== Task CRUD ====================

      /**
       * Create a new task
       * @param {Object} data - Task data
       */
      createTask: async (data) => {
        set({ isCreating: true, error: null });
        
        try {
          const response = await taskService.createTask(data);
          const newTask = response.data || response.task;

          // Emit event using core observer infrastructure
          taskEventPublisher.publishTaskCreated({
            taskId: String(newTask.id),
            projectId: String(newTask.project_id || ''),
            title: newTask.title,
            tagIds: newTask.tag_ids || [],
          });

          set((state) => ({
            tasks: [newTask, ...state.tasks],
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1,
            },
            isCreating: false,
          }));

          // Invalidate cache
          requestCache.invalidateCache("/api/tasks");

          return newTask;
        } catch (error) {
          set({ isCreating: false, error: error.message || "Failed to create task" });
          throw error;
        }
      },

      /**
       * Update a task
       * @param {number|string} id - Task ID
       * @param {Object} data - Task data
       */
      updateTask: async (id, data) => {
        const previousTasks = get().tasks;

        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id == id ? { ...t, ...data } : t)),
          isUpdating: true,
          error: null,
        }));

        try {
          const response = await taskService.updateTask(id, data);
          const updatedTask = response.data || response.task;

          // Get previous values for the event
          const previousTask = get().tasks.find(t => t.id == id);
          const previousValues = previousTask ? {
            title: previousTask.title,
            description: previousTask.description,
            is_completed: previousTask.is_completed,
            project_id: previousTask.project_id,
          } : {};

          // Emit event using core observer infrastructure
          taskEventPublisher.publishTaskUpdated({
            taskId: String(id),
            changes: data,
            previousValues,
            projectId: String(updatedTask?.project_id || ''),
            tagIds: updatedTask?.tag_ids || [],
          });

          // Update with server response
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id == id ? updatedTask : t
            ),
            selectedTask: state.selectedTask?.id == id
              ? updatedTask
              : state.selectedTask,
            isUpdating: false,
          }));

          // Invalidate cache
          requestCache.invalidateCache("/api/tasks");

          return updatedTask;
        } catch (error) {
          // Revert on error
          set({
            tasks: previousTasks,
            isUpdating: false,
            error: error.message || "Failed to update task",
          });
          throw error;
        }
      },

      /**
       * Patch a task (partial update)
       * @param {number|string} id - Task ID
       * @param {Object} data - Partial task data
       */
      patchTask: async (id, data) => {
        set({ isUpdating: true, error: null });
        try {
          const response = await taskService.patchTask(id, data);
          const updatedTask = response.data;
          
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id == id ? { ...task, ...updatedTask } : task
            ),
            selectedTask: state.selectedTask?.id == id
              ? { ...state.selectedTask, ...updatedTask }
              : state.selectedTask,
            isUpdating: false,
          }));
          
          return updatedTask;
        } catch (error) {
          set({ isUpdating: false, error });
          throw error;
        }
      },

      /**
       * Delete a task
       * @param {number|string} id - Task ID
       */
      deleteTask: async (id) => {
        const taskToDelete = get().tasks.find((t) => t.id == id);
        const previousTasks = get().tasks;

        // Optimistic update
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id != id),
          selectedTask: state.selectedTask?.id == id ? null : state.selectedTask,
          selectedIds: state.selectedIds.filter((selectedId) => selectedId != id),
          isDeleting: true,
          error: null,
        }));

        try {
          await taskService.deleteTask(id);

          // Emit event using core observer infrastructure
          taskEventPublisher.publishTaskDeleted({
            taskId: String(id),
            projectId: String(taskToDelete?.project_id || ''),
            tagIds: taskToDelete?.tag_ids || [],
          });

          set((state) => ({
            pagination: {
              ...state.pagination,
              total: state.pagination.total - 1,
            },
            isDeleting: false,
          }));

          // Invalidate cache
          requestCache.invalidateCache("/api/tasks");
        } catch (error) {
          // Revert on error
          set({
            tasks: previousTasks,
            isDeleting: false,
            error: error.message || "Failed to delete task",
          });
          throw error;
        }
      },

      /**
       * Batch delete tasks
       * @param {number[]} ids - Task IDs
       */
      batchDelete: async (ids) => {
        set({ isDeleting: true, error: null });
        try {
          await taskService.batchDelete(ids);
          
          set((state) => ({
            tasks: state.tasks.filter((task) => !ids.includes(task.id)),
            selectedIds: [],
            pagination: {
              ...state.pagination,
              total: state.pagination.total - ids.length,
            },
            isDeleting: false,
          }));
        } catch (error) {
          set({ isDeleting: false, error });
          throw error;
        }
      },

      /**
       * Toggle task completion
       * @param {Task} task - Task to toggle
       */
      toggleTask: async (task) => {
        const newStatus = !task.is_completed;

        // Optimistic update
        const previousTasks = get().tasks;
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id == task.id ? { ...t, is_completed: newStatus } : t
          ),
        }));

        try {
          const result = await taskService.updateTask(task.id, {
            is_completed: newStatus,
          });

          // Emit event using core observer infrastructure
          taskEventPublisher.publishTaskCompleted({
            taskId: String(task.id),
            projectId: String(task.project_id || ''),
            wasCompleted: newStatus,
            tagIds: task.tag_ids || [],
          });

          // Invalidate cache
          requestCache.invalidateCache("/api/tasks");

          return result;
        } catch (error) {
          // Revert on error
          set({
            tasks: previousTasks,
            error: error.message || "Failed to toggle task",
          });
          throw error;
        }
      },

      /**
       * Update task status
       * @param {number|string} id - Task ID
       * @param {string} status - New status
       */
      updateStatus: async (id, status) => {
        return get().patchTask(id, { status });
      },

      /**
       * Update task priority
       * @param {number|string} id - Task ID
       * @param {string} priority - New priority
       */
      updatePriority: async (id, priority) => {
        return get().patchTask(id, { priority });
      },

      // ==================== Filters ====================

      /**
       * Update filters and refetch
       * @param {Object} newFilters - New filters
       * @param {boolean} [shouldFetch=true] - Whether to fetch after update
       */
      updateFilters: async (newFilters, shouldFetch = true) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 },
        }));

        if (shouldFetch) {
          return get().fetchTasks(newFilters, 1);
        }
      },

      /**
       * Set filters
       * @param {Object} filters - Filters to set
       */
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          pagination: { ...state.pagination, page: 1 },
        }));
      },

      /**
       * Clear all filters
       */
      clearFilters: () => {
        set({ filters: createDefaultTaskFilter() });
        get().fetchTasks(createDefaultTaskFilter(), 1);
      },

      /**
       * Reset filters
       */
      resetFilters: () => {
        set({
          filters: createDefaultTaskFilter(),
          pagination: { ...get().pagination, page: 1 },
        });
      },

      /**
       * Set sort
       * @param {Object} sort - Sort configuration
       */
      setSort: (sort) => {
        set((state) => ({ 
          sort: { ...state.sort, ...sort },
          sortBy: sort.field || state.sortBy,
          sortOrder: sort.direction || state.sortOrder,
        }));
      },

      /**
       * Set sort options (legacy)
       * @param {string} sortBy - Sort field
       * @param {string} [sortOrder='desc'] - Sort direction
       */
      setSortOptions: (sortBy, sortOrder = "desc") => {
        set({ sortBy, sortOrder });
        get().fetchTasks();
      },

      // ==================== Pagination ====================

      /**
       * Set page
       * @param {number} page - Page number
       */
      setPage: (page) => {
        set((state) => ({
          pagination: { ...state.pagination, page },
        }));
      },

      /**
       * Go to specific page
       * @param {number} page - Page number
       */
      goToPage: (page) => {
        get().fetchTasks(null, page);
      },

      /**
       * Set per page
       * @param {number} perPage - Items per page
       */
      setPerPage: (perPage) => {
        set((state) => ({
          pagination: { ...state.pagination, perPage, page: 1 },
        }));
        get().fetchTasks();
      },

      // ==================== Selection ====================

      /**
       * Select a task (legacy - by object)
       * @param {Task|null} task - Task to select
       */
      selectTask: (task) => {
        set({ selectedTask: task });
      },

      /**
       * Select a task by ID
       * @param {number|string} id - Task ID
       */
      selectTaskById: (id) => {
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedIds, id],
        }));
      },

      /**
       * Toggle task selection
       * @param {number} taskId - Task ID
       */
      toggleTaskSelection: (taskId) => {
        set((state) => {
          const isSelected = state.selectedIds.includes(taskId);
          return {
            selectedIds: isSelected
              ? state.selectedIds.filter((id) => id !== taskId)
              : [...state.selectedIds, taskId],
          };
        });
      },

      /**
       * Select all tasks
       */
      selectAllTasks: () => {
        set((state) => ({
          selectedIds: state.tasks.map((t) => t.id),
        }));
      },

      /**
       * Select all (alias for selectAllTasks)
       */
      selectAll: () => {
        set((state) => ({
          selectedIds: state.tasks.map((task) => task.id),
        }));
      },

      /**
       * Clear selection
       */
      clearSelection: () => {
        set({ selectedIds: [], selectedTasks: [] });
      },

      // ==================== View ====================

      /**
       * Set view mode
       * @param {string} mode - View mode
       */
      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      /**
       * Set selected task for detail view
       * @param {Object|null} task - Task object
       */
      setSelectedTask: (task) => {
        set({ selectedTask: task });
      },

      // ==================== Quick Add ====================

      /**
       * Toggle quick add
       */
      toggleQuickAdd: () => {
        set((state) => ({ quickAddOpen: !state.quickAddOpen }));
      },

      /**
       * Open quick add
       */
      openQuickAdd: () => {
        set({ quickAddOpen: true });
      },

      /**
       * Close quick add
       */
      closeQuickAdd: () => {
        set({ quickAddOpen: false });
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
    })),
    { name: 'task-store' }
  
);

// ==================== Selectors ====================

/**
 * Selector for all tasks
 */
export const useTasks = () => useTaskStore((state) => state.tasks);

/**
 * Selector for task loading state
 */
export const useTaskLoading = () => useTaskStore((state) => state.isLoading);

/**
 * Selector for task error
 */
export const useTaskError = () => useTaskStore((state) => state.error);

/**
 * Selector for task pagination
 */
export const useTaskPagination = () => useTaskStore((state) => state.pagination);

/**
 * Selector for task filters
 */
export const useTaskFilters = () => useTaskStore((state) => state.filters);

/**
 * Selector for selected task
 */
export const useSelectedTask = () => useTaskStore((state) => state.selectedTask);

/**
 * Selector for selected task IDs
 */
export const useSelectedIds = () => useTaskStore((state) => state.selectedIds);

/**
 * Selector for selected tasks (returns task objects)
 */
export const useSelectedTasks = () =>
  useTaskStore((state) => state.tasks.filter((t) => state.selectedIds.includes(t.id)));

/**
 * Selector for task by ID
 * @param {number|string} id - Task ID
 */
export const useTaskById = (id) =>
  useTaskStore((state) => state.tasks.find((t) => t.id == id));

/**
 * Get task by ID
 * @param {number|string} id - Task ID
 * @returns {Object|undefined}
 */
const selectTaskById = (id) => (state) =>
  state.tasks.find((task) => task.id === id);

/**
 * Get tasks by status
 * @param {string} status - Task status
 * @returns {Object[]}
 */
const selectTasksByStatus = (status) => (state) =>
  state.tasks.filter((task) => task.status === status);

/**
 * Get tasks by project
 * @param {number|string} projectId - Project ID
 * @returns {Object[]}
 */
const selectTasksByProject = (projectId) => (state) =>
  state.tasks.filter((task) => task.project_id === projectId);

/**
 * Get completed tasks
 * @returns {Object[]}
 */
const selectCompletedTasks = () => (state) =>
  state.tasks.filter((task) => task.status === TaskStatus.COMPLETED);

/**
 * Get pending tasks
 * @returns {Object[]}
 */
const selectPendingTasks = () => (state) =>
  state.tasks.filter((task) => task.status === TaskStatus.PENDING);

/**
 * Get overdue tasks
 * @returns {Object[]}
 */
const selectOverdueTasks = () => (state) => {
  const now = new Date();
  return state.tasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate) < now &&
      task.status !== TaskStatus.COMPLETED
  );
};

/**
 * Get tasks due today
 * @returns {Object[]}
 */
const selectTasksDueToday = () => (state) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return state.tasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate < tomorrow;
  });
};

/**
 * Check if task is selected
 * @param {number|string} id - Task ID
 * @returns {boolean}
 */
const selectIsTaskSelected = (id) => (state) =>
  state.selectedIds.includes(id);

/**
 * Get selected tasks
 * @returns {Object[]}
 */
const selectSelectedTasks = () => (state) =>
  state.tasks.filter((task) => state.selectedIds.includes(task.id));

/**
 * Selector for task actions
 */
export const useTaskActions = () =>
  useTaskStore(useShallow((state) => ({
    fetchTasks: state.fetchTasks,
    fetchTask: state.fetchTask,
    createTask: state.createTask,
    updateTask: state.updateTask,
    patchTask: state.patchTask,
    deleteTask: state.deleteTask,
    batchDelete: state.batchDelete,
    toggleTask: state.toggleTask,
    updateStatus: state.updateStatus,
    updatePriority: state.updatePriority,
    updateFilters: state.updateFilters,
    setFilters: state.setFilters,
    clearFilters: state.clearFilters,
    resetFilters: state.resetFilters,
    setSort: state.setSort,
    setSortOptions: state.setSortOptions,
    setPage: state.setPage,
    goToPage: state.goToPage,
    setPerPage: state.setPerPage,
    selectTask: state.selectTask,
    selectTaskById: state.selectTaskById,
    toggleTaskSelection: state.toggleTaskSelection,
    selectAllTasks: state.selectAllTasks,
    selectAll: state.selectAll,
    clearSelection: state.clearSelection,
    setViewMode: state.setViewMode,
    setSelectedTask: state.setSelectedTask,
    toggleQuickAdd: state.toggleQuickAdd,
    openQuickAdd: state.openQuickAdd,
    closeQuickAdd: state.closeQuickAdd,
    refreshTasks: state.refreshTasks,
    reset: state.reset,
    clearError: state.clearError,
  })));

export {
  useTaskStore,
  selectTaskById,
  selectTasksByStatus,
  selectTasksByProject,
  selectCompletedTasks,
  selectPendingTasks,
  selectOverdueTasks,
  selectTasksDueToday,
  selectIsTaskSelected,
  selectSelectedTasks,
};

export default useTaskStore;
