/**
 * ============================================================================
 * AppLayout Component
 * Main application layout with NavigationRail for authenticated pages
 * ============================================================================
 */

import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavigationRail from '../NavigationRail/NavigationRail';
import './AppLayout.css';

/**
 * Navigation types mapping to backend filter parameters
 */
const FILTER_MAPPING = {
  inbox: { filter: 'inbox' },
  all: { filter: 'all' },
  completed: { filter: 'completed' },
};

/**
 * AppLayout Component
 * 
 * Wraps authenticated pages with the NavigationRail sidebar
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render
 * @param {boolean} props.collapsed - Initial collapsed state for NavigationRail
 * @param {Function} props.fetchTasks - Function to fetch tasks with filters
 */
export const AppLayout = ({
  children,
  collapsed = false,
  fetchTasks,
}) => {
  const [navCollapsed, setNavCollapsed] = useState(collapsed);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle navigation from NavigationRail
  const handleNavigate = useCallback((navigation) => {
    // navigation = { type: 'project|filter|tag|saved-view', id, params }
    const { type, id, params } = navigation;

    switch (type) {
      case 'project':
        // Navigate to project tasks
        if (fetchTasks) {
          fetchTasks({ project_id: params.project_id });
        }
        navigate(`/tasks?project_id=${params.project_id}`);
        break;

      case 'filter':
        // Navigate to filtered tasks
        const filterParams = FILTER_MAPPING[params.filter] || params;
        if (fetchTasks) {
          fetchTasks(filterParams);
        }
        navigate(`/tasks?filter=${params.filter}`);
        break;

      case 'tag':
        // Navigate to tag filtered tasks
        if (fetchTasks) {
          fetchTasks({ tag_id: params.tag_id });
        }
        navigate(`/tasks?tag_id=${params.tag_id}`);
        break;

      case 'saved-view':
        // Navigate to saved view
        if (fetchTasks) {
          fetchTasks(params);
        }
        navigate(`/saved-views/${id.replace('saved-view-', '')}`);
        break;

      default:
        // Default navigation to tasks
        navigate('/tasks');
    }
  }, [navigate, fetchTasks]);

  // Toggle NavigationRail collapsed state
  const toggleNavCollapse = () => {
    setNavCollapsed(!navCollapsed);
  };

  return (
    <div className="app-layout">
      <NavigationRail
        collapsed={navCollapsed}
        onNavigate={handleNavigate}
      />
      <main className={`app-layout__main ${navCollapsed ? 'app-layout__main--expanded' : ''}`}>
        <button
          className="app-layout__toggle"
          onClick={toggleNavCollapse}
          aria-label={navCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: navCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="app-layout__content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
