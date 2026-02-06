/**
 * ============================================================================
 * AppLayout Component
 * Main application layout with NavigationRail for authenticated pages
 * ============================================================================
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavigationRail } from './NavigationRail';
import './AppLayout.css';

/**
 * AppLayout Component
 * 
 * Wraps authenticated pages with the NavigationRail sidebar
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render
 * @param {boolean} props.collapsed - Initial collapsed state for NavigationRail
 */
export const AppLayout = ({
  children,
  collapsed = false,
}) => {
  const [navCollapsed, setNavCollapsed] = useState(collapsed);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle navigation from NavigationRail
  const handleNavigate = (itemId) => {
    // Map navigation items to routes
    const routes = {
      inbox: '/tasks',
      overdue: '/tasks?filter=overdue',
      today: '/tasks?filter=today',
      upcoming: '/tasks?filter=upcoming',
      'sl1': '/tasks?view=all',
      'sl2': '/tasks?filter=today',
      'sl3': '/tasks?filter=completed',
      'p1': '/tasks?project=personal',
      'p2': '/tasks?project=work',
      'p3': '/tasks?project=shopping',
      't1': '/tasks?tag=urgent',
      't2': '/tasks?tag=review',
      't3': '/tasks?tag=ideas',
      settings: '/settings',
    };

    const route = routes[itemId];
    if (route) {
      navigate(route);
    }
  };

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
