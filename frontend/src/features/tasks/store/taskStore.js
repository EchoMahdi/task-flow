/**
 * Tasks Feature - Store
 * 
 * State management for the tasks feature using Zustand.
 * Contains all task-related state and actions.
 * 
 * @module features/tasks/store
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { taskService } from '../services/taskService.js';
import {
  TaskStatus,
  TaskPriority,
  createDefaultTaskFilter,
  createDefaultTaskSort,
} from '../types/index.js';

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
  
  // UI State
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  
  // Selection
  selectedIds: [],
  
  // View state
  viewMode: 'list', // 'list' | 'board' | 'calendar'
  
  // Quick add
  quickAddOpen: false,
};

/**
 * Task store
 */
const useTaskStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,
      
      // ==================== Actions ====================
      
      /**
       * Fetch tasks with current filters
       */
      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          const { filters, sort, pagination } = get();
          const params = {
            ...filters,
            sortField: sort.field,
            sortDirection: sort.direction,
            page: pagination.page,
            perPage: pagination.perPage,
          };
          
          const response = await taskService.getTasks(params);
          
          set({
            tasks: response.data,
            pagination: {
              ...pagination,
              total: response.meta.total,
              totalPages: response.meta.last_page,
            },
            isLoading: false,
          });
          
          return response;
        } catch (error) {
          set({ isLoading: false, error });
          throw error;
        }
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
      
      /**
       * Create a new task
       * @param {Object} data - Task data
       */
      createTask: async (data) => {
        set({ isCreating: true, error: null });
        try {
          const response = await taskService.createTask(data);
          const newTask = response.data;
          
          set((state) => ({
            tasks: [newTask, ...state.tasks],
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1,
            },
            isCreating: false,
          }));
          
          return newTask;
        } catch (error) {
          set({ isCreating: false, error });
          throw error;
        }
      },
      
      /**
       * Update a task
       * @param {number|string} id - Task ID
       * @param {Object} data - Task data
       */
      updateTask: async (id, data) => {
        set({ isUpdating: true, error: null });
        try {
          const response = await taskService.updateTask(id, data);
          const updatedTask = response.data;
          
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? updatedTask : task
            ),
            selectedTask: state.selectedTask?.id === id
              ? updatedTask
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
              task.id === id ? { ...task, ...updatedTask } : task
            ),
            selectedTask: state.selectedTask?.id === id
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
        set({ isDeleting: true, error: null });
        try {
          await taskService.deleteTask(id);
          
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
            selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
            selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
            pagination: {
              ...state.pagination,
              total: state.pagination.total - 1,
            },
            isDeleting: false,
          }));
        } catch (error) {
          set({ isDeleting: false, error });
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
       * Set filters
       * @param {Object} filters - New filters
       */
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          pagination: { ...state.pagination, page: 1 },
        }));
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
        set({ sort: { ...get().sort, ...sort } });
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
       * Set per page
       * @param {number} perPage - Items per page
       */
      setPerPage: (perPage) => {
        set((state) => ({
          pagination: { ...state.pagination, perPage, page: 1 },
        }));
      },
      
      // ==================== Selection ====================
      
      /**
       * Select a task
       * @param {number|string} id - Task ID
       */
      selectTask: (id) => {
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedIds, id],
        }));
      },
      
      /**
       * Select all tasks
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
        set({ selectedIds: [] });
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
  )
);

// ==================== Selectors ====================

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
