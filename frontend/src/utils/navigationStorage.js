/**
 * ============================================================================
 * Navigation Storage Utilities
 * localStorage wrapper for persisting NavigationRail UI state
 * ============================================================================
 */

import React from 'react';

const STORAGE_PREFIX = 'todo_nav';

/**
 * Generate consistent storage key
 */
const getKey = (key) => `${STORAGE_PREFIX}_${key}`;

/**
 * Storage utility object
 */
export const navigationStorage = {
  /**
   * Get a value from localStorage
   */
  get(key, defaultValue = null) {
    try {
      const stored = localStorage.getItem(getKey(key));
      return stored === null ? defaultValue : JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  },

  /**
   * Set a value in localStorage
   */
  set(key, value) {
    try {
      localStorage.setItem(getKey(key), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Remove a value from localStorage
   */
  remove(key) {
    try {
      localStorage.removeItem(getKey(key));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Clear all navigation storage
   */
  clear() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_PREFIX));
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Specific storage keys for navigation state
 */
export const NAV_STORAGE_KEYS = {
  COLLAPSED: 'collapsed',
  WIDTH: 'width',
  ACTIVE_VIEW: 'active_view',
  SECTION_FILTERS_EXPANDED: 'section_filters_expanded',
  SECTION_FAVORITES_EXPANDED: 'section_favorites_expanded',
  SECTION_PROJECTS_EXPANDED: 'section_projects_expanded',
  SECTION_TAGS_EXPANDED: 'section_tags_expanded',
  SECTION_VIEWS_EXPANDED: 'section_views_expanded',
};

/**
 * Hook for managing navigation collapsed state
 */
export const useNavigationCollapsed = (defaultCollapsed = false) => {
  const [collapsed, setCollapsed] = React.useState(() => 
    navigationStorage.get(NAV_STORAGE_KEYS.COLLAPSED, defaultCollapsed)
  );

  React.useEffect(() => {
    navigationStorage.set(NAV_STORAGE_KEYS.COLLAPSED, collapsed);
  }, [collapsed]);

  return [collapsed, setCollapsed];
};

/**
 * Hook for managing navigation width
 */
export const useNavigationWidth = (defaultWidth = 280) => {
  const [width, setWidth] = React.useState(() => 
    navigationStorage.get(NAV_STORAGE_KEYS.WIDTH, defaultWidth)
  );

  React.useEffect(() => {
    navigationStorage.set(NAV_STORAGE_KEYS.WIDTH, width);
  }, [width]);

  return [width, setWidth];
};

/**
 * Hook for managing active view
 */
export const useActiveView = (defaultView = 'inbox') => {
  const [activeView, setActiveView] = React.useState(() => 
    navigationStorage.get(NAV_STORAGE_KEYS.ACTIVE_VIEW, defaultView)
  );

  React.useEffect(() => {
    navigationStorage.set(NAV_STORAGE_KEYS.ACTIVE_VIEW, activeView);
  }, [activeView]);

  return [activeView, setActiveView];
};

/**
 * Hook for managing section expanded state
 */
export const useSectionExpanded = (sectionKey, defaultExpanded = true) => {
  const [expanded, setExpanded] = React.useState(() => {
    const key = NAV_STORAGE_KEYS[sectionKey];
    return navigationStorage.get(key, defaultExpanded);
  });

  React.useEffect(() => {
    const key = NAV_STORAGE_KEYS[sectionKey];
    navigationStorage.set(key, expanded);
  }, [expanded, sectionKey]);

  return [expanded, setExpanded];
};

export default navigationStorage;
