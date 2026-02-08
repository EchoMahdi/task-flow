import { useState, useEffect, useCallback, useRef } from 'react';
import { api, initCsrf } from '../services/authService';

/**
 * Error handling helper - extracts user-friendly message
 */
const getErrorMessage = (error) => {
  if (error?.response?.status === 401) {
    return 'Session expired. Please log in again.';
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Custom hook for fetching and managing navigation data
 * 
 * Features:
 * - Per-section loading states
 * - Per-section error states  
 * - Optimistic updates with revert on failure
 * - 401 handling with redirect to login
 */
export const useNavigation = (options = {}) => {
  const { onError, on401 } = options;
  
  // Refs for stable callback access (breaks circular dependency chain)
  const on401Ref = useRef(on401);
  const onErrorRef = useRef(onError);
  
  // Keep refs in sync with props
  useEffect(() => {
    on401Ref.current = on401;
  }, [on401]);
  
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  
  const [navigationData, setNavigationData] = useState({
    systemFilters: [],
    projects: [],
    favorites: [],
    tags: [],
    savedViews: [],
    counts: {},
  });
  
  // Global loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Per-section loading states
  const [sectionLoading, setSectionLoading] = useState({
    projects: false,
    tags: false,
    savedViews: false,
    counts: false,
  });
  
  // Per-section error states
  const [sectionErrors, setSectionErrors] = useState({
    projects: null,
    tags: null,
    savedViews: null,
    counts: null,
  });
  
  // Refs for optimistic updates (to revert on failure)
  const previousStateRef = useRef(null);
  
  // Handle 401 redirect - now stable via ref
  const handle401 = useCallback((err) => {
    if (on401Ref.current) {
      on401Ref.current(err);
    } else {
      // Default: clear auth and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, []);
  
  // Handle error with callback - now stable via ref
  const handleError = useCallback((err, context = 'Navigation') => {
    const message = getErrorMessage(err);
    console.error(`${context} error:`, err);
    setError(message);
    if (onErrorRef.current) {
      onErrorRef.current(message, err);
    }
    return message;
  }, []);
  
  // Save state for potential revert - removed navigationData dependency
  const savePreviousState = useCallback(() => {
    previousStateRef.current = { ...navigationData };
  }, []);
  
  // Fetch all navigation data
  const fetchNavigationData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSectionErrors({
        projects: null,
        tags: null,
        savedViews: null,
        counts: null,
      });
      
      const response = await api.get('/navigation');
      setNavigationData(response.data);
      setError(null);
    } catch (err) {
      if (err?.response?.status === 401) {
        handle401(err);
      } else {
        handleError(err, 'Fetch navigation');
      }
    } finally {
      setLoading(false);
    }
  }, []); // Stable callbacks, no dependencies needed
  
  // Fetch counts only
  const fetchCounts = useCallback(async () => {
    try {
      setSectionLoading(prev => ({ ...prev, counts: true }));
      setSectionErrors(prev => ({ ...prev, counts: null }));
      
      const response = await api.get('/navigation/counts');
      setNavigationData(prev => ({
        ...prev,
        counts: response.data.counts,
      }));
    } catch (err) {
      if (err?.response?.status === 401) {
        handle401(err);
      } else {
        const msg = handleError(err, 'Fetch counts');
        setSectionErrors(prev => ({ ...prev, counts: msg }));
      }
    } finally {
      setSectionLoading(prev => ({ ...prev, counts: false }));
    }
  }, []); // Stable callbacks, no dependencies needed
  
  // Add a new project
  const addProject = useCallback(async (projectData) => {
    try {
      savePreviousState();
      setSectionLoading(prev => ({ ...prev, projects: true }));
      
      await initCsrf();
      const response = await api.post('/projects', projectData);
      
      setNavigationData(prev => ({
        ...prev,
        projects: [...prev.projects, response.data.project],
      }));
      
      return response.data.project;
    } catch (err) {
      if (err?.response?.status === 401) {
        handle401(err);
        throw err;
      }
      
      // Revert on error
      if (previousStateRef.current) {
        setNavigationData(previousStateRef.current);
      }
      
      const msg = handleError(err, 'Add project');
      throw new Error(msg);
    } finally {
      setSectionLoading(prev => ({ ...prev, projects: false }));
    }
  }, []); // Stable callbacks, no dependencies needed
  
  // Toggle project favorite status with optimistic update
  const toggleProjectFavorite = useCallback(async (projectId) => {
    // Get current project state from the current state in closure
    let currentIsFavorite = null;
    
    // Optimistic update - update state immediately
    setNavigationData(prev => {
      const project = prev.projects.find(p => p.id === projectId);
      currentIsFavorite = project?.is_favorite;
      const newIsFavorite = !currentIsFavorite;
      
      return {
        ...prev,
        projects: prev.projects.map(p =>
          p.id === projectId ? { ...p, is_favorite: newIsFavorite } : p
        ),
        favorites: newIsFavorite
          ? [...prev.favorites.filter(f => f.id !== projectId), project]
          : prev.favorites.filter(f => f.id !== projectId),
      };
    });
    
    try {
      const newIsFavorite = !currentIsFavorite;
      
      // API call
      await initCsrf();
      const response = await api.patch(`/projects/${projectId}/favorite`, {
        is_favorite: newIsFavorite,
      });
      
      const { is_favorite } = response.data;
      
      // Ensure sync with server response
      if (is_favorite !== newIsFavorite) {
        setNavigationData(prev => ({
          ...prev,
          projects: prev.projects.map(p =>
            p.id === projectId ? { ...p, is_favorite } : p
          ),
        }));
      }
      
      return is_favorite;
    } catch (err) {
      // Revert on error by refetching
      fetchNavigationData();
      
      if (err?.response?.status === 401) {
        handle401(err);
      } else {
        const msg = handleError(err, 'Toggle favorite');
        throw new Error(msg);
      }
      throw err;
    }
  }, [fetchNavigationData]); // Only depends on fetchNavigationData for error recovery
  const deleteProject = useCallback(async (projectId) => {
    try {
      savePreviousState();
      
      // Optimistic update
      setNavigationData(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== projectId),
        favorites: prev.favorites.filter(f => f.id !== projectId),
      }));
      
      await initCsrf();
      await api.delete(`/projects/${projectId}`);
    } catch (err) {
      // Revert on error
      if (previousStateRef.current) {
        setNavigationData(previousStateRef.current);
      }
      
      if (err?.response?.status === 401) {
        handle401(err);
      } else {
        const msg = handleError(err, 'Delete project');
        throw new Error(msg);
      }
      throw err;
    }
  }, []); // Stable callbacks, no dependencies needed
  
  // Add a new saved view
  const addSavedView = useCallback(async (viewData) => {
    try {
      savePreviousState();
      setSectionLoading(prev => ({ ...prev, savedViews: true }));
      
      await initCsrf();
      const response = await api.post('/saved-views', viewData);
      
      setNavigationData(prev => ({
        ...prev,
        savedViews: [...prev.savedViews, response.data.saved_view],
      }));
      
      return response.data.saved_view;
    } catch (err) {
      // Revert on error
      if (previousStateRef.current) {
        setNavigationData(previousStateRef.current);
      }
      
      if (err?.response?.status === 401) {
        handle401(err);
      } else {
        const msg = handleError(err, 'Add saved view');
        throw new Error(msg);
      }
      throw err;
    } finally {
      setSectionLoading(prev => ({ ...prev, savedViews: false }));
    }
  }, []); // Stable callbacks, no dependencies needed
  const deleteSavedView = useCallback(async (viewId) => {
    try {
      savePreviousState();
      
      // Optimistic update
      setNavigationData(prev => ({
        ...prev,
        savedViews: prev.savedViews.filter(v => v.id !== viewId),
      }));
      
      await initCsrf();
      await api.delete(`/saved-views/${viewId}`);
    } catch (err) {
      // Revert on error
      if (previousStateRef.current) {
        setNavigationData(previousStateRef.current);
      }
      
      if (err?.response?.status === 401) {
        handle401(err);
      } else {
        const msg = handleError(err, 'Delete saved view');
        throw new Error(msg);
      }
      throw err;
    }
  }, []); // Stable callbacks, no dependencies needed
  
  // Delete a tag
  const deleteTag = useCallback(async (tagId) => {
    try {
      savePreviousState();
      
      // Optimistic update
      setNavigationData(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t.id !== tagId),
      }));
      
      await initCsrf();
      await api.delete(`/tags/${tagId}`);
    } catch (err) {
      // Revert on error
      if (previousStateRef.current) {
        setNavigationData(previousStateRef.current);
      }
      
      if (err?.response?.status === 401) {
        handle401(err);
      } else {
        const msg = handleError(err, 'Delete tag');
        throw new Error(msg);
      }
      throw err;
    }
  }, []); // Stable callbacks, no dependencies needed
  
  // Add a new tag
  const addTag = useCallback(async (tagData) => {
    try {
      savePreviousState();
      setSectionLoading(prev => ({ ...prev, tags: true }));
      
      await initCsrf();
      const response = await api.post('/tags', tagData);
      
      setNavigationData(prev => ({
        ...prev,
        tags: [...prev.tags, response.data.tag],
      }));
      
      return response.data.tag;
    } catch (err) {
      // Revert on error
      if (previousStateRef.current) {
        setNavigationData(previousStateRef.current);
      }
      
      if (err?.response?.status === 401) {
        handle401(err);
      } else {
        const msg = handleError(err, 'Add tag');
        throw new Error(msg);
      }
      throw err;
    } finally {
      setSectionLoading(prev => ({ ...prev, tags: false }));
    }
  }, []); // Stable callbacks, no dependencies needed
  useEffect(() => {
    fetchNavigationData();
  }, [fetchNavigationData]);
  
  return {
    ...navigationData,
    loading,
    error,
    sectionLoading,
    sectionErrors,
    refetch: fetchNavigationData,
    fetchCounts,
    addProject,
    toggleProjectFavorite,
    deleteProject,
    addSavedView,
    deleteSavedView,
    addTag,
    deleteTag,
  };
};

export default useNavigation;
