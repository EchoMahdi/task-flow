import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Avatar, IconButton, Menu, MenuItem, Button, Tooltip, CircularProgress, Snackbar, Alert, Box } from '@mui/material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '../../../hooks/useNavigation';
import { navigationStorage, NAV_STORAGE_KEYS } from '../../../utils/navigationStorage';
import NavigationSkeleton from './NavigationSkeleton';
import NavigationError from './NavigationError';
import ProjectsSection from './ProjectsSection';
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
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
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
  const muiTheme = useMUITheme();
  const favoriteColor = muiTheme.palette.warning.main;
  const secondaryColor = muiTheme.palette.text.secondary;
  
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
            <FavoriteIcon fontSize="small" sx={{ color: favoriteColor }} />
          ) : (
            <FavoriteBorderIcon fontSize="small" sx={{ color: secondaryColor }} />
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
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  // Projects are now handled by ProjectsSection component

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

      {/* Projects Section - delegated to ProjectsSection component */}
      <ProjectsSection
        collapsed={collapsed}
        onNavigate={({ type, id, params }) => handleItemClick(id, params)}
      />

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
