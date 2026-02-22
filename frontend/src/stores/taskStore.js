/**
 * ============================================================================
 * Task Store - Zustand
 * ============================================================================
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
 *
 * @example
 * // Basic usage
 * const { tasks, fetchTasks, createTask, updateTask } = useTaskStore()
 *
 * // With selectors
 * const tasks = useTaskStore(state => state.tasks)
 */

import { create } from "zustand";
import { taskService } from "@/services/taskService";
import requestCache from "@/utils/requestCache";
import { taskEventEmitter } from "@/utils/eventBus";

// ============================================================================
// Types
// ============================================================================

/**
 * @typedef {Object} Task
 * @property {number} id - Task ID
 * @property {string} title - Task title
 * @property {string} [description] - Task description
 * @property {string} [status] - Task status
 * @property {string} [priority] - Task priority
 * @property {boolean} is_completed - Completion status
 * @property {number} [project_id] - Project ID
 * @property {number[]} [tag_ids] - Tag IDs
 */

/**
 * @typedef {Object} PaginationState
 * @property {number} current_page - Current page number
 * @property {number} last_page - Last page number
 * @property {number} total - Total items
 * @property {number} per_page - Items per page
 */

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  },
  filters: {},
  sortBy: "created_at",
  sortOrder: "desc",
  selectedTask: null,
  selectedTasks: [],
  editingTask: null,
};

// In-flight request tracking for deduplication
const pendingRequests = new Map();

// AbortController for canceling in-flight requests
let abortController = null;

// Default cache TTL (30 seconds)
const DEFAULT_CACHE_TTL = 30000;

// ============================================================================
// Task Store
// ============================================================================

export const useTaskStore = create((set, get) => ({
  ...initialState,

  // ==========================================================================
  // Fetch Tasks
  // ==========================================================================

  /**
   * Fetch tasks with current filters
   * @param {Object} [customFilters] - Override filters
   * @param {number} [customPage] - Override page
   * @returns {Promise<Object>} Response data
   */
  fetchTasks: async (customFilters = null, customPage = null) => {
    const { pagination, filters, sortBy, sortOrder } = get();
    const page = customPage ?? pagination.current_page;
    const currentFilters = customFilters ?? filters;

    // Generate cache key
    const cacheKey = JSON.stringify({
      page,
      per_page: pagination.per_page,
      sortBy,
      sortOrder,
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
          current_page: cached.current_page || page,
          last_page: cached.last_page || 1,
          total: cached.total || 0,
          per_page: cached.per_page || pagination.per_page,
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

    set({ loading: true, error: null });

    // Update pagination page if customPage was provided
    if (customPage !== null) {
      set((state) => ({
        pagination: { ...state.pagination, current_page: customPage },
      }));
    }

    // Build API params
    const apiParams = {
      page,
      per_page: pagination.per_page,
      sort_by: sortBy,
      sort_order: sortOrder,
    };

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
    if (currentFilters.filter) {
      if (currentFilters.filter === "completed") {
        apiParams.status = "completed";
      }
      if (currentFilters.filter === "inbox") {
        apiParams.project_id = null;
        apiParams.tag_id = null;
      }
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
            current_page: data.current_page || page,
            last_page: data.last_page || 1,
            total: data.total || 0,
            per_page: data.per_page || pagination.per_page,
          },
          loading: false,
        });

        return data;
      } catch (error) {
        // Ignore abort errors
        if (error.name === "AbortError") {
          return null;
        }

        set({
          error: error.message || "Failed to fetch tasks",
          loading: false,
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

  // ==========================================================================
  // Filter & Pagination
  // ==========================================================================

  /**
   * Update filters and refetch
   * @param {Object} newFilters - New filters
   * @param {boolean} [shouldFetch=true] - Whether to fetch after update
   */
  updateFilters: async (newFilters, shouldFetch = true) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));

    if (shouldFetch) {
      return get().fetchTasks(newFilters, 1);
    }
  },

  /**
   * Set filters without fetching
   * @param {Object} filters - Filters to set
   */
  setFilters: (filters) => {
    set({ filters });
  },

  /**
   * Clear all filters
   */
  clearFilters: () => {
    set({ filters: {} });
    get().fetchTasks({}, 1);
  },

  /**
   * Set sort options
   * @param {string} sortBy - Sort field
   * @param {string} [sortOrder='desc'] - Sort direction
   */
  setSort: (sortBy, sortOrder = "desc") => {
    set({ sortBy, sortOrder });
    get().fetchTasks();
  },

  /**
   * Go to specific page
   * @param {number} page - Page number
   */
  goToPage: (page) => {
    get().fetchTasks(null, page);
  },

  /**
   * Set items per page
   * @param {number} perPage - Items per page
   */
  setPerPage: (perPage) => {
    set((state) => ({
      pagination: { ...state.pagination, per_page: perPage, current_page: 1 },
    }));
    get().fetchTasks();
  },

  // ==========================================================================
  // Task CRUD Operations
  // ==========================================================================

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} Created task
   */
  createTask: async (taskData) => {
    try {
      const result = await taskService.createTask(taskData);

      // Emit event for other components
      taskEventEmitter.emitTaskCreated({
        task: result.data,
        project_id: result.data.project_id,
        tag_ids: result.data.tag_ids,
        is_completed: result.data.is_completed,
      });

      // Invalidate cache and refresh
      requestCache.invalidateCache("/api/tasks");
      await get().refreshTasks();

      return result;
    } catch (error) {
      set({ error: error.message || "Failed to create task" });
      throw error;
    }
  },

  /**
   * Update an existing task
   * @param {number} id - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise<Object>} Updated task
   */
  updateTask: async (id, taskData) => {
    // Optimistic update
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...taskData } : t)),
    }));

    try {
      const result = await taskService.updateTask(id, taskData);

      // Emit event
      taskEventEmitter.emitTaskUpdated({
        taskId: id,
        project_id: result.data?.project_id,
        tag_ids: result.data?.tag_ids,
        is_completed: result.data?.is_completed,
      });

      // Invalidate cache
      requestCache.invalidateCache("/api/tasks");

      return result;
    } catch (error) {
      // Revert on error
      set({
        tasks: previousTasks,
        error: error.message || "Failed to update task",
      });
      throw error;
    }
  },

  /**
   * Delete a task
   * @param {number} id - Task ID
   */
  deleteTask: async (id) => {
    const taskToDelete = get().tasks.find((t) => t.id === id);

    // Optimistic update
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));

    try {
      await taskService.deleteTask(id);

      // Emit event
      taskEventEmitter.emitTaskDeleted({
        taskId: id,
        project_id: taskToDelete?.project_id,
        tag_ids: taskToDelete?.tag_ids,
        is_completed: taskToDelete?.is_completed,
      });

      // Invalidate cache
      requestCache.invalidateCache("/api/tasks");
    } catch (error) {
      // Revert on error
      set({
        tasks: previousTasks,
        error: error.message || "Failed to delete task",
      });
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
        t.id === task.id ? { ...t, is_completed: newStatus } : t,
      ),
    }));

    try {
      const result = await taskService.updateTask(task.id, {
        is_completed: newStatus,
      });

      // Emit event
      if (newStatus) {
        taskEventEmitter.emitTaskCompleted({
          taskId: task.id,
          project_id: task.project_id,
          tag_ids: task.tag_ids,
        });
      } else {
        taskEventEmitter.emitTaskUncompleted({
          taskId: task.id,
          project_id: task.project_id,
          tag_ids: task.tag_ids,
        });
      }

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

  // ==========================================================================
  // Task Selection
  // ==========================================================================

  /**
   * Select a task
   * @param {Task|null} task - Task to select
   */
  selectTask: (task) => {
    set({ selectedTask: task });
  },

  /**
   * Toggle task selection
   * @param {number} taskId - Task ID
   */
  toggleTaskSelection: (taskId) => {
    set((state) => {
      const isSelected = state.selectedTasks.includes(taskId);
      return {
        selectedTasks: isSelected
          ? state.selectedTasks.filter((id) => id !== taskId)
          : [...state.selectedTasks, taskId],
      };
    });
  },

  /**
   * Select all tasks
   */
  selectAllTasks: () => {
    set((state) => ({
      selectedTasks: state.tasks.map((t) => t.id),
    }));
  },

  /**
   * Clear selection
   */
  clearSelection: () => {
    set({ selectedTasks: [] });
  },

  /**
   * Set editing task
   * @param {Task|null} task - Task to edit
   */
  setEditingTask: (task) => {
    set({ editingTask: task });
  },

  // ==========================================================================
  // Bulk Operations
  // ==========================================================================

  /**
   * Bulk update tasks
   * @param {number[]} taskIds - Task IDs to update
   * @param {Object} updates - Updates to apply
   */
  bulkUpdate: async (taskIds, updates) => {
    const previousTasks = get().tasks;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        taskIds.includes(t.id) ? { ...t, ...updates } : t,
      ),
    }));

    try {
      // Assuming bulk update endpoint exists
      await taskService.bulkUpdate(taskIds, updates);

      // Invalidate cache
      requestCache.invalidateCache("/api/tasks");

      // Clear selection
      set({ selectedTasks: [] });
    } catch (error) {
      // Revert on error
      set({
        tasks: previousTasks,
        error: error.message || "Failed to update tasks",
      });
      throw error;
    }
  },

  /**
   * Bulk delete tasks
   * @param {number[]} taskIds - Task IDs to delete
   */
  bulkDelete: async (taskIds) => {
    const previousTasks = get().tasks;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.filter((t) => !taskIds.includes(t.id)),
    }));

    try {
      await taskService.bulkDelete(taskIds);

      // Invalidate cache
      requestCache.invalidateCache("/api/tasks");

      // Clear selection
      set({ selectedTasks: [] });
    } catch (error) {
      // Revert on error
      set({
        tasks: previousTasks,
        error: error.message || "Failed to delete tasks",
      });
      throw error;
    }
  },

  // ==========================================================================
  // Reset
  // ==========================================================================

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(initialState);
    pendingRequests.clear();
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  },
}));

// ============================================================================
// Selectors
// ============================================================================

/**
 * Selector for tasks
 */
export const useTasks = () => useTaskStore((state) => state.tasks);

/**
 * Selector for task loading state
 */
export const useTaskLoading = () => useTaskStore((state) => state.loading);

/**
 * Selector for task error
 */
export const useTaskError = () => useTaskStore((state) => state.error);

/**
 * Selector for pagination
 */
export const useTaskPagination = () =>
  useTaskStore((state) => state.pagination);

/**
 * Selector for filters
 */
export const useTaskFilters = () => useTaskStore((state) => state.filters);

/**
 * Selector for selected task
 */
export const useSelectedTask = () =>
  useTaskStore((state) => state.selectedTask);

/**
 * Selector for selected tasks
 */
export const useSelectedTasks = () =>
  useTaskStore((state) => state.selectedTasks);

/**
 * Selector for task by ID
 */
export const useTaskById = (id) =>
  useTaskStore((state) => state.tasks.find((t) => t.id === id));

/**
 * Selector for task actions
 */
export const useTaskActions = () =>
  useTaskStore(
    useShallow((state) => ({
      fetchTasks: state.fetchTasks,
      refreshTasks: state.refreshTasks,
      updateFilters: state.updateFilters,
      setFilters: state.setFilters,
      clearFilters: state.clearFilters,
      setSort: state.setSort,
      goToPage: state.goToPage,
      setPerPage: state.setPerPage,
      createTask: state.createTask,
      updateTask: state.updateTask,
      deleteTask: state.deleteTask,
      toggleTask: state.toggleTask,
      selectTask: state.selectTask,
      toggleTaskSelection: state.toggleTaskSelection,
      selectAllTasks: state.selectAllTasks,
      clearSelection: state.clearSelection,
      setEditingTask: state.setEditingTask,
      bulkUpdate: state.bulkUpdate,
      bulkDelete: state.bulkDelete,
      reset: state.reset,
      clearError: state.clearError,
    })),
  );

export default useTaskStore;
