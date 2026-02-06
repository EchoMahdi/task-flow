/**
 * ============================================================================
 * AppShell Component
 * Main layout shell implementing the 3-zone layout:
 * - Navigation Rail (Left)
 * - Main Workspace (Center)
 * - Context Panel (Right)
 * ============================================================================
 */

import React, { useState } from 'react';
import './AppShell.css';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';

/**
 * AppShell Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.navigation - Navigation rail content
 * @param {React.ReactNode} props.workspace - Main workspace content
 * @param {React.ReactNode} props.contextPanel - Context panel content
 * @param {boolean} props.showContextPanel - Whether to show context panel
 * @param {Function} props.onCloseContext - Callback when context panel closes
 */
export const AppShell = ({
  navigation,
  workspace,
  contextPanel,
  showContextPanel = false,
  onCloseContext,
}) => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  return (
    <div className="app-shell">
      {/* Navigation Rail */}
      <aside
        className={[
          'app-shell__nav-rail',
          isNavCollapsed && 'app-shell__nav-rail--collapsed',
        ].filter(Boolean).join(' ')}
      >
        <div className="app-shell__nav-content">
          {navigation}
        </div>
        
        {/* Collapse Toggle */}
        <button
          className="app-shell__nav-toggle"
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          aria-label={isNavCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          <ChevronLeftIcon
            className={[
              'app-shell__nav-toggle-icon',
              isNavCollapsed && 'app-shell__nav-toggle-icon--flipped',
            ].filter(Boolean).join(' ')}
          />
        </button>
      </aside>

      {/* Main Workspace */}
      <main className="app-shell__workspace">
        {workspace}
      </main>

      {/* Context Panel */}
      {showContextPanel && (
        <aside className="app-shell__context-panel">
          <div className="app-shell__context-header">
            <button
              className="app-shell__context-close"
              onClick={onCloseContext}
              aria-label="Close context panel"
            >
              <CloseIcon className="app-shell__context-close-icon" />
            </button>
          </div>
          <div className="app-shell__context-content">
            {contextPanel}
          </div>
        </aside>
      )}
    </div>
  );
};

AppShell.displayName = 'AppShell';

export default AppShell;
