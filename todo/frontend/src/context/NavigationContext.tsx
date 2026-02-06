/**
 * ============================================================================
 * NavigationContext
 * Global state for current navigation/view selection
 * ============================================================================
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface NavigationState {
  type: 'project' | 'filter' | 'tag' | 'saved-view' | null;
  id: string | null;
  name: string | null;
  params: Record<string, unknown> | null;
}

interface NavigationContextType {
  currentNavigation: NavigationState;
  setNavigation: (navigation: NavigationState) => void;
  clearNavigation: () => void;
  isActive: (type: string, id: string) => boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

/**
 * NavigationProvider Component
 * Manages current navigation state for the entire app
 */
export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentNavigation, setCurrentNavigation] = useState<NavigationState>(() => {
    // Initialize from URL params if available
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get('project_id');
      const tagId = params.get('tag_id');
      const filter = params.get('filter');
      
      if (projectId) {
        return { type: 'project', id: `project-${projectId}`, name: null, params: { project_id: projectId } };
      }
      if (tagId) {
        return { type: 'tag', id: `tag-${tagId}`, name: null, params: { tag_id: tagId } };
      }
      if (filter) {
        return { type: 'filter', id: filter, name: null, params: { filter } };
      }
    }
    
    return { type: 'filter', id: 'all', name: 'All Tasks', params: { filter: 'all' } };
  });

  // Update state when URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get('project_id');
      const tagId = params.get('tag_id');
      const filter = params.get('filter');

      if (projectId && currentNavigation.type !== 'project') {
        setCurrentNavigation({
          type: 'project',
          id: `project-${projectId}`,
          name: null,
          params: { project_id: projectId }
        });
      } else if (tagId && currentNavigation.type !== 'tag') {
        setCurrentNavigation({
          type: 'tag',
          id: `tag-${tagId}`,
          name: null,
          params: { tag_id: tagId }
        });
      } else if (filter && currentNavigation.type !== 'filter') {
        setCurrentNavigation({
          type: 'filter',
          id: filter,
          name: null,
          params: { filter }
        });
      }
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleUrlChange);
    
    // Also check URL on mount
    handleUrlChange();

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const setNavigation = useCallback((navigation: NavigationState) => {
    setCurrentNavigation(navigation);
  }, []);

  const clearNavigation = useCallback(() => {
    setCurrentNavigation({ type: null, id: null, name: null, params: null });
  }, []);

  const isActive = useCallback((type: string, id: string) => {
    return currentNavigation.type === type && currentNavigation.id === id;
  }, [currentNavigation]);

  return (
    <NavigationContext.Provider value={{ currentNavigation, setNavigation, clearNavigation, isActive }}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * Hook to access navigation state
 */
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

/**
 * Hook to set current navigation with automatic URL updates
 */
export const useSetNavigation = () => {
  const { setNavigation } = useNavigation();

  return useCallback((navigation: NavigationState) => {
    setNavigation(navigation);
    
    // Update URL using history API
    if (navigation.params) {
      const params = new URLSearchParams();
      Object.entries(navigation.params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.set(key, String(value));
        }
      });
      const url = `/tasks?${params.toString()}`;
      window.history.pushState({}, '', url);
    }
  }, [setNavigation]);
};

export default NavigationContext;
