/**
 * ============================================================================
 * useTasks Hook
 * Optimized hook for task fetching with caching and request deduplication
 * Supports both direct service calls and TaskModel integration
 * ============================================================================
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { taskService } from '../services/taskService';
import requestCache from '../utils/requestCache';
import { taskEventEmitter, TaskEvents } from '../utils/eventBus';
import { TaskModel } from '../models/TaskModel';

// In-flight request promises for deduplication
const pendingRequests = new Map();

/**
 * Custom hook for fetching and managing tasks
 * @param {Object} options - Hook options
 * @param {Object} options.initialFilters - Initial filter values
 * @param {boolean} options.autoFetch - Whether to fetch on mount (default: true)
 * @param {number} options.cacheTTL - Cache TTL in ms (default: 30000)
 * @param {boolean} options.useModel - Whether to use TaskModel for operations (default: false)
 * @returns {Object} Task state and handlers
 */
const useTasks = (options = {}) => {
  const {
    initialFilters = {},
    autoFetch = true,
    cacheTTL = 30000, // 30 seconds default cache
    useModel = false,
  } = options;

  // State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  });
  const [filters, setFilters] = useState(initialFilters);

  // Ref for current filters (to avoid stale closures)
  const filtersRef = useRef(filters);
  const abortControllerRef = useRef(null);

  // Keep filters ref in sync
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  /**
   * Generate cache key for current filters
   */
  const getCacheKey = useCallback((page) => {
    return JSON.stringify({
      page,
      per_page: pagination.per_page,
      ...filtersRef.current,
    });
  }, [pagination.per_page]);

  /**
   * Fetch tasks with caching and deduplication
   */
  const fetchTasks = useCallback(async (customFilters = null, customPage = null) => {
    const page = customPage ?? pagination.current_page;
    const currentFilters = customFilters ?? filtersRef.current;
    
    // Generate cache key
    const cacheKey = JSON.stringify({
      page,
      per_page: pagination.per_page,
      ...currentFilters,
    });

    // Check cache first (only for same page/filter combination)
    const cached = requestCache.getCachedResponse('GET', '/api/tasks', currentFilters, cacheTTL);
    if (cached && !customFilters && !customPage) {
      setTasks(cached.data || []);
      setPagination(prev => ({
        current_page: cached.current_page || page,
        last_page: cached.last_page || 1,
        total: cached.total || 0,
        per_page: cached.per_page || pagination.per_page,
      }));
      return cached;
    }

    // Check for in-flight request (deduplication)
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    // Update pagination page if customPage was provided
    if (customPage !== null) {
      setPagination(prev => ({ ...prev, current_page: customPage }));
    }

    const params = {
      page,
      per_page: pagination.per_page,
      ...currentFilters,
    };

    // Build params object properly
    // NOTE: All sorting and filtering is handled by the backend.
    // The frontend only builds query parameters and renders the returned data.
    const apiParams = {
      page: params.page,
      per_page: params.per_page,
    };

    if (params.sort_by) apiParams.sort_by = params.sort_by;
    if (params.sort_order) apiParams.sort_order = params.sort_order;
    if (params.status && params.status !== 'all') apiParams.status = params.status;
    if (params.priority && params.priority !== 'all') apiParams.priority = params.priority;
    if (params.search) apiParams.search = params.search;
    if (params.project_id) apiParams.project_id = params.project_id;
    if (params.tag_id) apiParams.tag_id = params.tag_id;
    if (params.filter) {
      if (params.filter === 'completed') apiParams.status = 'completed';
      if (params.filter === 'inbox') {
        apiParams.project_id = null;
        apiParams.tag_id = null;
      }
    }

    // Debug logging for diagnostic purposes
    console.log('[useTasks] Fetching tasks with params:', apiParams);
    console.log('[useTasks] DEBUG: AbortController pattern - creating new controller for deduplication');

    const requestPromise = (async () => {
      try {
        const data = await taskService.getTasks(apiParams);
        
        // Cache the response
        requestCache.setCachedResponse('GET', '/api/tasks', currentFilters, data);
        
        // Update state
        setTasks(data.data || []);
        setPagination(prev => ({
          current_page: data.current_page || page,
          last_page: data.last_page || 1,
          total: data.total || 0,
          per_page: data.per_page || pagination.per_page,
        }));
        
        return data;
      } catch (error) {
        // Ignore abort errors
        if (error.name === 'AbortError') {
          return null;
        }
        
        setError(error.message || 'Failed to fetch tasks');
        throw error;
      } finally {
        setLoading(false);
        pendingRequests.delete(cacheKey);
        abortControllerRef.current = null;
      }
    })();

    // Store in-flight request
    pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }, [pagination.per_page, pagination.current_page, cacheTTL]);

  /**
   * Refresh tasks (force refetch, bypass cache)
   */
  const refreshTasks = useCallback(async () => {
    // Invalidate cache for tasks
    requestCache.invalidateCache('/api/tasks');
    return fetchTasks();
  }, [fetchTasks]);

  /**
   * Update filters and optionally refetch
   */
  const updateFilters = useCallback((newFilters, shouldFetch = true) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      return updated;
    });
    
    if (shouldFetch) {
      return fetchTasks(newFilters, 1);
    }
    
    return Promise.resolve();
  }, [fetchTasks]);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((page) => {
    return fetchTasks(null, page);
  }, [fetchTasks]);

  /**
   * Create a new task using TaskModel
   * @param {Object} taskData - Task data
   * @param {Object} options - Options
   * @returns {Promise<Object>} Created task result
   */
  const createTask = useCallback(async (taskData, options = {}) => {
    if (useModel || options.useModel) {
      // Use TaskModel for creation
      const model = new TaskModel(taskData);
      return model.create();
    }
    
    // Fallback to direct service call
    const result = await taskService.createTask(taskData);
    
    // Emit event for other components
    taskEventEmitter.emitTaskCreated({
      task: result.data,
      project_id: result.data.project_id,
      tag_ids: result.data.tag_ids,
      is_completed: result.data.is_completed,
    });
    
    // Invalidate cache and refresh if needed
    requestCache.invalidateCache('/api/tasks');
    
    return result;
  }, [useModel]);

  /**
   * Update an existing task using TaskModel
   * @param {number} id - Task ID
   * @param {Object} taskData - Task data
   * @param {Object} options - Options
   * @returns {Promise<Object>} Updated task result
   */
  const updateTask = useCallback(async (id, taskData, options = {}) => {
    if (useModel || options.useModel) {
      // Use TaskModel for update
      const model = new TaskModel(taskData);
      return model.update(id);
    }
    
    // Fallback to direct service call
    const result = await taskService.updateTask(id, taskData);
    
    // Emit event
    taskEventEmitter.emitTaskUpdated({
      taskId: id,
      project_id: result.data?.project_id,
      tag_ids: result.data?.tag_ids,
      is_completed: result.data?.is_completed,
    });
    
    // Invalidate cache and refresh if needed
    requestCache.invalidateCache('/api/tasks');
    
    return result;
  }, [useModel]);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id) => {
    // Find task data before deleting for event emission
    const taskToDelete = tasks.find(t => t.id === id);
    
    const result = await taskService.deleteTask(id);
    
    // Emit event
    taskEventEmitter.emitTaskDeleted({
      taskId: id,
      project_id: taskToDelete?.project_id,
      tag_ids: taskToDelete?.tag_ids,
      is_completed: taskToDelete?.is_completed,
    });
    
    // Invalidate cache and refresh
    requestCache.invalidateCache('/api/tasks');
    await refreshTasks();
    
    return result;
  }, [tasks, refreshTasks]);

  /**
   * Toggle task completion status
   */
  const toggleTask = useCallback(async (task) => {
    const newStatus = !task.is_completed;
    
    const result = await taskService.updateTask(task.id, { is_completed: newStatus });
    
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
    
    // Invalidate cache and refresh
    requestCache.invalidateCache('/api/tasks');
    await refreshTasks();
    
    return result;
  }, [refreshTasks]);

  /**
   * Create a TaskModel instance with optional initial data
   * @param {Object} initialData - Initial data for the model
   * @returns {TaskModel} New TaskModel instance
   */
  const createModel = useCallback((initialData = {}) => {
    return new TaskModel(initialData);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchTasks();
    }
    
    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      pendingRequests.clear();
    };
  }, [autoFetch, fetchTasks]);

  return {
    // State
    tasks,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    fetchTasks,
    refreshTasks,
    updateFilters,
    goToPage,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    createModel,
    
    // Setters
    setTasks,
    setPagination,
  };
};

export default useTasks;
