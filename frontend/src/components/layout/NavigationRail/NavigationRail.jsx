/**
 * ============================================================================
 * NavigationRail Component
 * Production-ready left zone navigation with real backend data:
 * - User section (Logo + UserAvatar)
 * - Projects (with favorites)
 * - Filters (System + Custom)
 * - Saved Views
 * - Tags
 * Features:
 * - Skeleton loading states
 * - Error handling with retry
 * - Optimistic updates with revert on failure
 * - 401 handling with redirect to login
 * ============================================================================
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Avatar, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Tooltip, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '../../../hooks/useNavigation';
import { navigationStorage, NAV_STORAGE_KEYS } from '../../../utils/navigationStorage';
import NavigationSkeleton from './NavigationSkeleton';
import NavigationError from './NavigationError';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import InboxIcon from '@mui/icons-material/Inbox';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DateRangeIcon from '@mui/icons-material/DateRange';
import StarIcon from '@mui/icons-material/Star';
import FolderIcon from '@mui/icons-material/Folder';
import LabelIcon from '@mui/icons-material/Label';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import './NavigationRail.css';

/**
 * Navigation item sub-component
 */
const NavItem = ({
  icon: Icon,
  label,
  badge,
  active,
  collapsed,
  onClick,
  color,
  showFavorite,
  isFavorite,
  onToggleFavorite,
  loading = false,
}) => {
  const itemContent = (
    <div
      className={['nav-item', active && 'nav-item--active'].filter(Boolean).join(' ')}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
      aria-label={label}
      style={color ? { '--item-color': color } : {}}
    >
      {Icon && <Icon className="nav-item__icon" style={color ? { color } : {}} />}
      {!collapsed && <span className="nav-item__label">{label}</span>}
      {badge !== undefined && badge !== null && badge > 0 && (
        <span className="nav-item__badge">{badge}</span>
      )}
      {!collapsed && showFavorite && (
        <IconButton
          size="small"
          className="nav-item__favorite"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={16} />
          ) : isFavorite ? (
            <FavoriteIcon fontSize="small" sx={{ color: '#f59e0b' }} />
          ) : (
            <FavoriteBorderIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          )}
        </IconButton>
      )}
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip title={label} placement="right">
        {itemContent}
      </Tooltip>
    );
  }

  return itemContent;
};

/**
 * Collapsible section sub-component
 */
const NavSection = ({
  title,
  icon: Icon,
  children,
  collapsed,
  defaultExpanded = true,
  onAdd,
  addLabel = 'Add',
  storageKey,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const initialized = useRef(false);

  // Load expanded state from localStorage on mount
  useEffect(() => {
    if (storageKey && !initialized.current) {
      initialized.current = true;
      const saved = navigationStorage.get(storageKey);
      if (typeof saved === 'boolean') {
        setIsExpanded(saved);
      }
    }
  }, [storageKey]);

  // Save expanded state to localStorage when it changes
  useEffect(() => {
    if (storageKey && initialized.current) {
      navigationStorage.set(storageKey, isExpanded);
    }
  }, [isExpanded, storageKey]);

  if (collapsed) {
    return (
      <div className="nav-section">
        {children}
      </div>
    );
  }

  return (
    <div className="nav-section">
      <button
        className="nav-section__header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        {Icon && <Icon className="nav-section__icon" />}
        <span className="nav-section__title">{title}</span>
        <ExpandMoreIcon
          className={[
            'nav-section__chevron',
            isExpanded && 'nav-section__chevron--expanded',
          ].filter(Boolean).join(' ')}
        />
      </button>
      {isExpanded && (
        <div className="nav-section__content">
          {children}
          {onAdd && (
            <button className="nav-item nav-item--add" onClick={onAdd}>
              <AddIcon className="nav-item__icon" />
              <span className="nav-item__label">{addLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Get icon component by name
 */
const getIconByName = (iconName) => {
  const icons = {
    inbox: InboxIcon,
    format_list_bulleted: FormatListBulletedIcon,
    calendar_today: CalendarTodayIcon,
    check_circle: CheckCircleIcon,
    schedule: ScheduleIcon,
    date_range: DateRangeIcon,
    folder: FolderIcon,
    label: LabelIcon,
    view_list: ViewListIcon,
  };
  return icons[iconName] || FormatListBulletedIcon;
};

/**
 * Get count for a filter type
 */
const getCount = (counts, filterId) => {
  return counts[filterId] || 0;
};

/**
 * NavigationRail Component
 * 
 * @param {Object} props
 * @param {boolean} props.collapsed - Whether the nav is collapsed
 * @param {Function} props.onNavigate - Callback when navigation item is clicked
 */
const NavigationRail = ({
  collapsed = false,
  onNavigate = () => {},
}) => {
  const { user, logout } = useAuth();
  const {
    systemFilters,
    projects,
    favorites,
    tags,
    savedViews,
    counts,
    loading,
    error,
    refetch,
    addProject,
    toggleProjectFavorite,
    sectionLoading,
  } = useNavigation({
    on401: () => {
      // Handle 401 - redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    },
    onError: (message) => {
      // Show error toast
      setErrorMessage(message);
      setShowError(true);
    },
  });

  const [activeItem, setActiveItem] = useState('inbox');
  
  // Restore active view from localStorage on mount
  useEffect(() => {
    const savedView = navigationStorage.get(NAV_STORAGE_KEYS.ACTIVE_VIEW);
    if (savedView) {
      setActiveItem(savedView);
    }
  }, []);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#3B82F6');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mutatingItem, setMutatingItem] = useState(null); // Track item being mutated

  // Handle navigation item click
  const handleItemClick = useCallback((itemId, filterData = null) => {
    setActiveItem(itemId);
    navigationStorage.set(NAV_STORAGE_KEYS.ACTIVE_VIEW, itemId);
    onNavigate(itemId, filterData);
  }, [onNavigate]);

  // Handle user menu
  const handleUserMenuOpen = useCallback((event) => {
    setUserMenuAnchor(event.currentTarget);
  }, []);

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // Handle logout
  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
  };

  // Handle add project
  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      setMutatingItem('adding-project');
      await addProject({
        name: newProjectName,
        color: newProjectColor,
      });
      setNewProjectName('');
      setNewProjectColor('#3B82F6');
      setAddProjectDialogOpen(false);
    } catch (err) {
      console.error('Failed to add project:', err);
    } finally {
      setMutatingItem(null);
    }
  };

  // Handle toggle favorite with optimistic update
  const handleToggleFavorite = async (projectId) => {
    try {
      setMutatingItem(`favorite-${projectId}`);
      await toggleProjectFavorite(projectId);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setMutatingItem(null);
    }
  };

  // Loading state with skeleton
  if (loading && !(systemFilters || []).length) {
    return (
      <nav className="navigation-rail" aria-label="Main navigation">
        <NavigationSkeleton collapsed={collapsed} />
      </nav>
    );
  }

  // Critical error state
  if (error && !(systemFilters || []).length) {
    return (
      <nav className="navigation-rail" aria-label="Main navigation">
        <NavigationError
          message={error}
          title="Failed to load navigation"
          onRetry={refetch}
        />
      </nav>
    );
  }

  return (
    <nav className="navigation-rail" aria-label="Main navigation">
      {/* User Section */}
      <div className="nav-section nav-section--user">
        <div className="nav-user">
          {user?.avatar ? (
            <Avatar
              src={user.avatar}
              alt={user?.name || 'User'}
              className="nav-user__avatar"
            />
          ) : (
            <Avatar
              className="nav-user__avatar"
              sx={{ bgcolor: 'primary.main' }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          )}
          {!collapsed && (
            <div className="nav-user__info">
              <span className="nav-user__name">{user?.name || 'User'}</span>
              <span className="nav-user__email">{user?.email || 'user@example.com'}</span>
            </div>
          )}
          {!collapsed && (
            <IconButton
              size="small"
              className="nav-user__menu-button"
              onClick={handleUserMenuOpen}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          )}
        </div>
      </div>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={() => { handleUserMenuClose(); handleItemClick('profile'); }}>
          <PersonIcon fontSize="small" style={{ marginRight: 8 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => { handleUserMenuClose(); handleItemClick('settings'); }}>
          <SettingsIcon fontSize="small" style={{ marginRight: 8 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" style={{ marginRight: 8 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* System Filters Section */}
      <NavSection
        title="Filters"
        icon={FilterListIcon}
        collapsed={collapsed}
        defaultExpanded={true}
        storageKey={NAV_STORAGE_KEYS.SECTION_FILTERS_EXPANDED}
      >
        {(systemFilters || []).map((filter) => {
          const Icon = getIconByName(filter.icon);
          return (
            <NavItem
              key={filter.id}
              icon={Icon}
              label={filter.name}
              badge={filter.count > 0 ? filter.count : null}
              active={activeItem === filter.id}
              collapsed={collapsed}
              onClick={() => handleItemClick(filter.id, filter.filter)}
            />
          );
        })}
      </NavSection>

      {/* Favorites Section (if there are favorites) */}
      {(favorites || []).length > 0 && !collapsed && (
        <NavSection
          title="Favorites"
          icon={StarIcon}
          collapsed={collapsed}
          defaultExpanded={true}
          storageKey={NAV_STORAGE_KEYS.SECTION_FAVORITES_EXPANDED}
        >
          {(favorites || []).map((project) => (
            <NavItem
              key={`fav-${project.id}`}
              icon={FolderIcon}
              label={project.name}
              badge={project.task_count > 0 ? project.task_count : null}
              active={activeItem === `project-${project.id}`}
              collapsed={collapsed}
              color={project.color}
              onClick={() => handleItemClick(`project-${project.id}`, { project_id: project.id })}
            />
          ))}
        </NavSection>
      )}

      {/* Projects Section */}
      <NavSection
        title="Projects"
        icon={FolderIcon}
        collapsed={collapsed}
        defaultExpanded={true}
        onAdd={() => setAddProjectDialogOpen(true)}
        addLabel="Add Project"
        storageKey={NAV_STORAGE_KEYS.SECTION_PROJECTS_EXPANDED}
      >
        {(projects || []).map((project) => (
          <NavItem
            key={project.id}
            icon={FolderIcon}
            label={project.name}
            badge={project.task_count > 0 ? project.task_count : null}
            active={activeItem === `project-${project.id}`}
            collapsed={collapsed}
            color={project.color}
            showFavorite={true}
            isFavorite={project.is_favorite}
            loading={mutatingItem === `favorite-${project.id}`}
            onToggleFavorite={() => handleToggleFavorite(project.id)}
            onClick={() => handleItemClick(`project-${project.id}`, { project_id: project.id })}
          />
        ))}
      </NavSection>

      {/* Saved Views Section */}
      {(savedViews || []).length > 0 && (
        <NavSection
          title="Saved Views"
          icon={ViewListIcon}
          collapsed={collapsed}
          defaultExpanded={false}
          storageKey={NAV_STORAGE_KEYS.SECTION_VIEWS_EXPANDED}
        >
          {(savedViews || []).map((view) => {
            const Icon = getIconByName(view.icon);
            return (
              <NavItem
                key={view.id}
                icon={Icon}
                label={view.name}
                active={activeItem === `view-${view.id}`}
                collapsed={collapsed}
                onClick={() => handleItemClick(`view-${view.id}`, view.filters)}
              />
            );
          })}
        </NavSection>
      )}

      {/* Tags Section */}
      {(tags || []).length > 0 && (
        <NavSection
          title="Tags"
          icon={LabelIcon}
          collapsed={collapsed}
          defaultExpanded={false}
          storageKey={NAV_STORAGE_KEYS.SECTION_TAGS_EXPANDED}
        >
          {(tags || []).map((tag) => (
            <NavItem
              key={tag.id}
              icon={LabelIcon}
              label={tag.name}
              active={activeItem === `tag-${tag.id}`}
              collapsed={collapsed}
              color={tag.color}
              onClick={() => handleItemClick(`tag-${tag.id}`, { tag_id: tag.id })}
            />
          ))}
        </NavSection>
      )}

      {/* Settings at bottom */}
      <div className="nav-section nav-section--bottom">
        <NavItem
          icon={SettingsIcon}
          label="Settings"
          active={activeItem === 'settings'}
          collapsed={collapsed}
          onClick={() => handleItemClick('settings')}
        />
      </div>

      {/* Add Project Dialog */}
      <Dialog
        open={addProjectDialogOpen}
        onClose={() => setAddProjectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'text.secondary' }}>
              Color
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'].map((color) => (
                <button
                  key={color}
                  onClick={() => setNewProjectColor(color)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: newProjectColor === color ? '3px solid #000' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddProjectDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddProject} 
            variant="contained" 
            disabled={!newProjectName.trim() || mutatingItem === 'adding-project'}
            startIcon={mutatingItem === 'adding-project' ? <CircularProgress size={16} /> : null}
          >
            {mutatingItem === 'adding-project' ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </nav>
  );
};

NavigationRail.displayName = 'NavigationRail';

export default NavigationRail;
