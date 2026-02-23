/**
 * Tasks Feature - Hooks
 * 
 * Custom hooks for the tasks feature.
 * 
 * @module features/tasks/hooks
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useTaskStore, selectTaskById, selectTasksByStatus, selectOverdueTasks, selectTasksDueToday } from '../store/taskStore.js';
import { useDebounce } from '../../../shared/hooks/index.js';

/**
 * Hook for task operations
 * @returns {Object} Task operations and state
 */
export function useTasks() {
  const {
    tasks,
    pagination,
    filters,
    sort,
    isLoading,
    error,
    selectedIds,
    viewMode,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    batchDelete,
    setFilters,
    resetFilters,
    setSort,
    setPage,
    setPerPage,
    selectTask,
    selectAll,
    clearSelection,
    setViewMode,
    clearError,
  } = useTaskStore();

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300);

  // Fetch tasks when filters change
  useEffect(() => {
    fetchTasks();
  }, [debouncedSearch, filters.statuses, filters.priorities, filters.projectIds, sort, pagination.page, pagination.perPage]);

  // Memoized counts
  const counts = useMemo(() => ({
    total: pagination.total,
    selected: selectedIds.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
  }), [tasks, pagination.total, selectedIds]);

  return {
    // Data
    tasks,
    pagination,
    filters,
    sort,
    selectedIds,
    viewMode,
    
    // State
    isLoading,
    error,
    counts,
    
    // Actions
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    batchDelete,
    setFilters,
    resetFilters,
    setSort,
    setPage,
    setPerPage,
    selectTask,
    selectAll,
    clearSelection,
    setViewMode,
    clearError,
  };
}

/**
 * Hook for a single task
 * @param {number|string} taskId - Task ID
 * @returns {Object} Task data and operations
 */
export function useTask(taskId) {
  const {
    selectedTask,
    isLoading,
    isUpdating,
    isDeleting,
    error,
    fetchTask,
    updateTask,
    patchTask,
    deleteTask,
    updateStatus,
    updatePriority,
    setSelectedTask,
    clearError,
  } = useTaskStore();

  // Get task from store
  const task = useTaskStore(selectTaskById(taskId));

  // Fetch task if not in store
  useEffect(() => {
    if (taskId && !task) {
      fetchTask(taskId);
    }
  }, [taskId, task, fetchTask]);

  // Local operations
  const handleUpdate = useCallback(async (data) => {
    return updateTask(taskId, data);
  }, [taskId, updateTask]);

  const handlePatch = useCallback(async (data) => {
    return patchTask(taskId, data);
  }, [taskId, patchTask]);

  const handleDelete = useCallback(async () => {
    await deleteTask(taskId);
  }, [taskId, deleteTask]);

  const handleStatusChange = useCallback(async (status) => {
    return updateStatus(taskId, status);
  }, [taskId, updateStatus]);

  const handlePriorityChange = useCallback(async (priority) => {
    return updatePriority(taskId, priority);
  }, [taskId, updatePriority]);

  return {
    task: task || selectedTask,
    isLoading,
    isUpdating,
    isDeleting,
    error,
    
    // Actions
    updateTask: handleUpdate,
    patchTask: handlePatch,
    deleteTask: handleDelete,
    updateStatus: handleStatusChange,
    updatePriority: handlePriorityChange,
    setSelectedTask,
    clearError,
  };
}

/**
 * Hook for task creation
 * @returns {Object} Creation state and actions
 */
export function useTaskCreate() {
  const {
    isCreating,
    error,
    createTask,
    quickAddOpen,
    openQuickAdd,
    closeQuickAdd,
    clearError,
  } = useTaskStore();

  const handleCreate = useCallback(async (data) => {
    const task = await createTask(data);
    closeQuickAdd();
    return task;
  }, [createTask, closeQuickAdd]);

  return {
    isCreating,
    error,
    quickAddOpen,
    
    // Actions
    createTask: handleCreate,
    openQuickAdd,
    closeQuickAdd,
    clearError,
  };
}

/**
 * Hook for task filtering
 * @returns {Object} Filter state and actions
 */
export function useTaskFilters() {
  const {
    filters,
    sort,
    setFilters,
    resetFilters,
    setSort,
  } = useTaskStore();

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.statuses.length) count++;
    if (filters.priorities.length) count++;
    if (filters.projectIds.length) count++;
    if (filters.tagIds.length) count++;
    if (filters.dueDateFrom || filters.dueDateTo) count++;
    if (filters.assigneeId) count++;
    return count;
  }, [filters]);

  // Has active filters
  const hasActiveFilters = activeFilterCount > 0;

  // Update search
  const setSearch = useCallback((search) => {
    setFilters({ search });
  }, [setFilters]);

  // Toggle status filter
  const toggleStatus = useCallback((status) => {
    const statuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    setFilters({ statuses });
  }, [filters.statuses, setFilters]);

  // Toggle priority filter
  const togglePriority = useCallback((priority) => {
    const priorities = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];
    setFilters({ priorities });
  }, [filters.priorities, setFilters]);

  // Toggle project filter
  const toggleProject = useCallback((projectId) => {
    const projectIds = filters.projectIds.includes(projectId)
      ? filters.projectIds.filter((id) => id !== projectId)
      : [...filters.projectIds, projectId];
    setFilters({ projectIds });
  }, [filters.projectIds, setFilters]);

  // Toggle tag filter
  const toggleTag = useCallback((tagId) => {
    const tagIds = filters.tagIds.includes(tagId)
      ? filters.tagIds.filter((id) => id !== tagId)
      : [...filters.tagIds, tagId];
    setFilters({ tagIds });
  }, [filters.tagIds, setFilters]);

  // Set date range
  const setDateRange = useCallback((from, to) => {
    setFilters({ dueDateFrom: from, dueDateTo: to });
  }, [setFilters]);

  // Set assignee
  const setAssignee = useCallback((assigneeId) => {
    setFilters({ assigneeId });
  }, [setFilters]);

  return {
    filters,
    sort,
    activeFilterCount,
    hasActiveFilters,
    
    // Actions
    setFilters,
    resetFilters,
    setSort,
    setSearch,
    toggleStatus,
    togglePriority,
    toggleProject,
    toggleTag,
    setDateRange,
    setAssignee,
  };
}

/**
 * Hook for task statistics
 * @returns {Object} Task statistics
 */
export function useTaskStats() {
  const tasks = useTaskStore((state) => state.tasks);
  
  const overdueTasks = useTaskStore(selectOverdueTasks());
  const tasksDueToday = useTaskStore(selectTasksDueToday());
  
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const highPriority = tasks.filter((t) => t.priority === 'high' || t.priority === 'urgent').length;
    
    return {
      total,
      completed,
      pending,
      inProgress,
      highPriority,
      overdue: overdueTasks.length,
      dueToday: tasksDueToday.length,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks, overdueTasks, tasksDueToday]);
  
  return stats;
}

/**
 * Hook for task selection
 * @returns {Object} Selection state and actions
 */
export function useTaskSelection() {
  const {
    selectedIds,
    tasks,
    selectTask,
    selectAll,
    clearSelection,
  } = useTaskStore();

  const selectedTasks = useMemo(() =>
    tasks.filter((task) => selectedIds.includes(task.id)),
    [tasks, selectedIds]
  );

  const isSelected = useCallback((id) =>
    selectedIds.includes(id),
    [selectedIds]
  );

  const toggleSelection = useCallback((id) => {
    selectTask(id);
  }, [selectTask]);

  const allSelected = tasks.length > 0 && selectedIds.length === tasks.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < tasks.length;

  return {
    selectedIds,
    selectedTasks,
    allSelected,
    someSelected,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
  };
}

export default {
  useTasks,
  useTask,
  useTaskCreate,
  useTaskFilters,
  useTaskStats,
  useTaskSelection,
};
