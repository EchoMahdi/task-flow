/**
 * ============================================================================
 * HeaderToolbar Component
 * 
 * Professional application header with navigation, search, actions, and controls.
 * Fully integrated with theme, language, notifications, and user state.
 * ============================================================================
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import  LanguageSwitcher  from '@/components/ui/LanguageSwitcher/LanguageSwitcher';
import {
  useThemeMode,
  useDirection,
  useColors,
  useSpacing,
  useBorderRadius,
  useFocusRing,
} from '@/theme';
import HeaderToolbarStyles from './HeaderToolbar.module.css';
import SearchInput from '@/components/ui/SearchInput';
import useTaskSearch from '@/hooks/useTaskSearch';

// MUI Icons - Replacing inline SVG icons
import {
  CheckBox  as LogoIcon,
  Search as SearchIcon,
  Add as AddTaskIcon,
  Notifications as NotificationsIcon,
  Person as UserIcon,
  LightMode as ThemeLightIcon,
  DarkMode as ThemeDarkIcon,
  Computer as ThemeSystemIcon,
  KeyboardArrowDown as ChevronDownIcon,
  Close as CloseIcon,
  ViewList as ViewListIcon,
  Dashboard as ViewBoardIcon,
  FilterList as FilterIcon,
  Today as TodayIcon,
  Schedule as UpcomingIcon,
  Error as OverdueIcon,
  Sort as SortIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as ProfileIcon,
  Menu as MenuIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

// ============================================================================
// Search Component
// ============================================================================

function SearchSection({ onSearch }) {
  const { t } = useTranslation();
  const colors = useColors();
  const navigate = useNavigate();

  // Use the production-ready search hook
  const {
    query,
    results,
    loading,
    suggestions,
    suggestionsLoading,
    setQuery,
    clearSearch,
    fetchSuggestions,
    performSearch,
  } = useTaskSearch({
    debounceMs: 300,
    autoSearch: false,
  });

  // Navigate to search results page when search is submitted
  const handleSubmit = useCallback(
    (searchValue) => {
      if (searchValue.trim()) {
        navigate(`/tasks?search=${encodeURIComponent(searchValue.trim())}`);
      }
    },
    [navigate]
  );

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion) => {
      navigate(`/tasks?search=${encodeURIComponent(suggestion)}`);
    },
    [navigate]
  );

  return (
    <div className={HeaderToolbarStyles.searchSection}>
      <SearchInput
        value={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        onClear={clearSearch}
        placeholder={t('search.placeholder') || 'Search tasks, projects, tags...'}
        loading={loading}
        suggestions={suggestions}
        showSuggestions={true}
        onSuggestionSelect={fetchSuggestions}
        size="medium"
        fullWidth={true}
        ariaLabel={t('search.ariaLabel') || 'Search tasks, projects, and tags'}
        style={{
          '--search-bg': colors.background.secondary,
          '--search-border': colors.border.default,
          '--search-placeholder': colors.text.muted,
          '--search-text': colors.text.primary,
          '--search-focus': colors.primary[500],
          '--search-focus-ring': `${colors.primary[500]}20`,
          '--search-icon': colors.text.muted,
        }}
      />
      
      {/* Quick search results dropdown */}
      {results.length > 0 && query && (
        <div className={HeaderToolbarStyles.searchResultsDropdown}>
          <div className={HeaderToolbarStyles.searchResultsHeader}>
            <span>{t('search.resultsCount', { count: results.length })}</span>
            <button
              onClick={() => navigate(`/tasks?search=${encodeURIComponent(query)}`)}
              className={HeaderToolbarStyles.viewAllLink}
            >
              {t('search.viewAll')}
            </button>
          </div>
          {results.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className={HeaderToolbarStyles.searchResultItem}
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              <span className={HeaderToolbarStyles.resultTitle}>{task.title}</span>
              {task.project && (
                <span className={HeaderToolbarStyles.resultProject}>
                  {task.project.name}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Theme Toggle Component
// ============================================================================

function ThemeToggle({ variant = 'dropdown' }) {
  const { mode, setThemeMode, toggleThemeMode, availableModes } = useThemeMode();
  const colors = useColors();
  const spacing = useSpacing();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const modeIcons = {
    light: <ThemeLightIcon />,
    dark: <ThemeDarkIcon />,
    system: <ThemeSystemIcon />,
  };

  const modeLabels = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'toggle') {
    return (
      <button
        onClick={toggleThemeMode}
        className={HeaderToolbarStyles.iconButton}
        aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        title={`Current mode: ${mode}`}
      >
        {mode === 'dark' ? <ThemeLightIcon /> : <ThemeDarkIcon />}
      </button>
    );
  }

  return (
    <div ref={dropdownRef} className={HeaderToolbarStyles.dropdown}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={HeaderToolbarStyles.dropdownTrigger}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Theme settings"
      >
        <span className={HeaderToolbarStyles.triggerIcon}>
          {modeIcons[mode]}
        </span>
        <span className={HeaderToolbarStyles.triggerLabel}>
          {modeLabels[mode]}
        </span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <>
          <div
            className={HeaderToolbarStyles.dropdownBackdrop}
            onClick={() => setIsOpen(false)}
          />
          <div
            className={HeaderToolbarStyles.dropdownMenu}
            style={{
              '--dropdown-bg': colors.surface.default,
              '--dropdown-border': colors.border.default,
            }}
          >
            {availableModes.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setThemeMode(m);
                  setIsOpen(false);
                }}
                className={`${HeaderToolbarStyles.dropdownItem} ${
                  mode === m ? HeaderToolbarStyles.active : ''
                }`}
              >
                <span className={HeaderToolbarStyles.dropdownItemIcon}>
                  {modeIcons[m]}
                </span>
                <span>{modeLabels[m]}</span>
                {mode === m && (
                  <span className={HeaderToolbarStyles.checkmark}>
                    <CheckIcon />
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Language Switcher Component
// ============================================================================

// ============================================================================
// Notification Panel Component
// ============================================================================

function NotificationPanel({ onClose }) {
  const { t } = useTranslation();
  const colors = useColors();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock notifications for demo - in real app, fetch from API
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          title: 'Task due soon',
          message: 'Complete project report by 5 PM',
          time: '2 hours ago',
          read: false,
        },
        {
          id: 2,
          title: 'New comment',
          message: 'Sarah commented on your task',
          time: '5 hours ago',
          read: false,
        },
        {
          id: 3,
          title: 'Task completed',
          message: 'Weekly sync was marked complete',
          time: '1 day ago',
          read: true,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div
        className={HeaderToolbarStyles.dropdownBackdrop}
        onClick={onClose}
      />
      <div
        className={HeaderToolbarStyles.notificationPanel}
        style={{
          '--panel-bg': colors.surface.default,
          '--panel-border': colors.border.default,
        }}
        role="dialog"
        aria-label="Notifications"
      >
        <div className={HeaderToolbarStyles.panelHeader}>
          <h3>{t('notifications.title')}</h3>
          {unreadCount > 0 && (
            <button
              className={HeaderToolbarStyles.markAllRead}
              onClick={() =>
                setNotifications((prev) =>
                  prev.map((n) => ({ ...n, read: true }))
                )
              }
            >
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>

        <div className={HeaderToolbarStyles.notificationList}>
          {loading ? (
            <div className={HeaderToolbarStyles.loadingState}>
              {t('common.loading')}
            </div>
          ) : notifications.length === 0 ? (
            <div className={HeaderToolbarStyles.emptyState}>
              {t('notifications.noNotifications')}
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${HeaderToolbarStyles.notificationItem} ${
                  !notification.read ? HeaderToolbarStyles.unread : ''
                }`}
              >
                <div className={HeaderToolbarStyles.notificationContent}>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <span className={HeaderToolbarStyles.notificationTime}>
                    {notification.time}
                  </span>
                </div>
                {!notification.read && (
                  <span className={HeaderToolbarStyles.unreadDot} />
                )}
              </div>
            ))
          )}
        </div>

        <div className={HeaderToolbarStyles.panelFooter}>
          <a
            href="/notifications"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
          >
            {t('nav.notifications')}
          </a>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// User Menu Component
// ============================================================================

function UserMenu({ user, onLogout }) {
  const { t } = useTranslation();
  const colors = useColors();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div ref={dropdownRef} className={HeaderToolbarStyles.userMenu}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={HeaderToolbarStyles.userMenuTrigger}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div
          className={HeaderToolbarStyles.userAvatar}
          style={{ backgroundColor: colors.primary[500] }}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            userInitials
          )}
        </div>
        <div className={HeaderToolbarStyles.userInfo}>
          <span className={HeaderToolbarStyles.userName}>
            {user?.name || 'User'}
          </span>
          <span className={HeaderToolbarStyles.userEmail}>{user?.email}</span>
        </div>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <>
          <div
            className={HeaderToolbarStyles.dropdownBackdrop}
            onClick={() => setIsOpen(false)}
          />
          <div
            className={HeaderToolbarStyles.dropdownMenu}
            style={{
              '--dropdown-bg': colors.surface.default,
              '--dropdown-border': colors.border.default,
            }}
          >
            <div className={HeaderToolbarStyles.userMenuHeader}>
              <div
                className={HeaderToolbarStyles.userAvatarLarge}
                style={{ backgroundColor: colors.primary[500] }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  userInitials
                )}
              </div>
              <div>
                <strong>{user?.name || 'User'}</strong>
                <span>{user?.email}</span>
              </div>
            </div>

            <div className={HeaderToolbarStyles.dropdownDivider} />

            <a href="/profile" className={HeaderToolbarStyles.dropdownItem}>
              <ProfileIcon />
              <span>{t('nav.profile')}</span>
            </a>
            <a href="/settings" className={HeaderToolbarStyles.dropdownItem}>
              <SettingsIcon />
              <span>{t('nav.settings')}</span>
            </a>

            <div className={HeaderToolbarStyles.dropdownDivider} />

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout?.();
              }}
              className={HeaderToolbarStyles.dropdownItem}
            >
              <LogoutIcon />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// View Controls Component
// ============================================================================

function ViewControls({
  currentView,
  onViewChange,
  currentFilter,
  onFilterChange,
}) {
  const { t } = useTranslation();
  const colors = useColors();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  const views = [
    { id: 'list', icon: <ViewListIcon />, label: 'List' },
    { id: 'board', icon: <ViewBoardIcon />, label: 'Board' },
  ];

  const filters = [
    { id: 'today', label: 'Today', icon: <TodayIcon /> },
    { id: 'upcoming', label: 'Upcoming', icon: <UpcomingIcon /> },
    { id: 'overdue', label: 'Overdue', icon: <OverdueIcon /> },
  ];

  const sortOptions = [
    { id: 'date', label: 'Date' },
    { id: 'priority', label: 'Priority' },
    { id: 'name', label: 'Name' },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={HeaderToolbarStyles.viewControls}>
      {/* View Toggle */}
      <div
        className={HeaderToolbarStyles.viewToggle}
        role="group"
        aria-label="View type"
      >
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange?.(view.id)}
            className={`${HeaderToolbarStyles.viewToggleBtn} ${
              currentView === view.id ? HeaderToolbarStyles.active : ''
            }`}
            aria-pressed={currentView === view.id}
            title={view.label}
          >
            {view.icon}
          </button>
        ))}
      </div>

      {/* Quick Filters */}
      <div ref={filterRef} className={HeaderToolbarStyles.dropdown}>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={HeaderToolbarStyles.filterButton}
          aria-expanded={isFilterOpen}
          aria-haspopup="true"
        >
          <FilterIcon />
          <span>
            {currentFilter
              ? filters.find((f) => f.id === currentFilter)?.label
              : t('common.filter')}
          </span>
        </button>

        {isFilterOpen && (
          <>
            <div
              className={HeaderToolbarStyles.dropdownBackdrop}
              onClick={() => setIsFilterOpen(false)}
            />
            <div
              className={HeaderToolbarStyles.dropdownMenu}
              style={{
                '--dropdown-bg': colors.surface.default,
                '--dropdown-border': colors.border.default,
              }}
            >
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    onFilterChange?.(filter.id);
                    setIsFilterOpen(false);
                  }}
                  className={`${HeaderToolbarStyles.dropdownItem} ${
                    currentFilter === filter.id ? HeaderToolbarStyles.active : ''
                  }`}
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                  {currentFilter === filter.id && (
                    <span className={HeaderToolbarStyles.checkmark}>
                      <CheckIcon />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sort */}
      <div ref={sortRef} className={HeaderToolbarStyles.dropdown}>
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className={HeaderToolbarStyles.filterButton}
          aria-expanded={isSortOpen}
          aria-haspopup="true"
        >
          <SortIcon />
          <span>{t('tasks.sortBy')}</span>
        </button>

        {isSortOpen && (
          <>
            <div
              className={HeaderToolbarStyles.dropdownBackdrop}
              onClick={() => setIsSortOpen(false)}
            />
            <div
              className={HeaderToolbarStyles.dropdownMenu}
              style={{
                '--dropdown-bg': colors.surface.default,
                '--dropdown-border': colors.border.default,
              }}
            >
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setIsSortOpen(false)}
                  className={HeaderToolbarStyles.dropdownItem}
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main HeaderToolbar Component
// ============================================================================

/**
 * HeaderToolbar - Professional application header
 * @param {Object} props
 * @param {Function} props.onAddTask - Callback when add task is clicked
 * @param {Function} props.onSearch - Callback when search query changes
 * @param {string} props.currentView - Current view (list/board)
 * @param {Function} props.onViewChange - Callback when view changes
 * @param {string} props.currentFilter - Current filter
 * @param {Function} props.onFilterChange - Callback when filter changes
 * @param {boolean} props.showViewControls - Show view controls
 * @param {boolean} props.showSearch - Show search input
 */
export function HeaderToolbar({
  onAddTask,
  onSearch,
  currentView = 'list',
  onViewChange,
  currentFilter,
  onFilterChange,
  showViewControls = true,
  showSearch = true,
}) {
  const { user, logout } = useAuth();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL, direction } = useDirection();
  const colors = useColors();
  const spacing = useSpacing();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Mock count

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return t('dashboard.title');
    if (path.startsWith('/tasks')) {
      if (path === '/tasks') return t('tasks.title');
      if (path.includes('/new')) return t('tasks.create');
      return t('tasks.view');
    }
    if (path === '/notifications') return t('notifications.title');
    if (path === '/profile') return t('profile.title');
    if (path === '/settings') return t('settings.title');
    return t('app.name');
  };

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  return (
    <header
      className={HeaderToolbarStyles.header}
      style={{
        '--header-bg': colors.background.primary,
        '--header-border': colors.border.default,
        '--header-text': colors.text.primary,
      }}
      role="banner"
    >
      <div className={HeaderToolbarStyles.container}>
        {/* Left Section - Brand & Navigation */}
        <div className={HeaderToolbarStyles.sectionLeft}>
          {/* Mobile Menu Toggle */}
          <button
            className={HeaderToolbarStyles.iconButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={{ display: 'none' }}
          >
            <MenuIcon />
          </button>

          {/* Logo/Home */}
          <a
            href="/dashboard"
            className={HeaderToolbarStyles.logo}
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard');
            }}
            aria-label="Go to Inbox"
          >
            <LogoIcon />
            <span className={HeaderToolbarStyles.logoText}>
              {t('app.name')}
            </span>
          </a>

          {/* Page Title (Desktop) */}
          <span className={HeaderToolbarStyles.pageTitle}>
            {getPageTitle()}
          </span>
        </div>

        {/* Center Section - Search */}
        {showSearch && (
          <div className={HeaderToolbarStyles.sectionCenter}>
            <SearchSection />
          </div>
        )}

        {/* Right Section - Actions */}
        <div className={HeaderToolbarStyles.sectionRight}>
          {/* Add Task Button */}
          <button
            onClick={onAddTask?.onAddTask ? onAddTask.onAddTask : () => navigate('/tasks/new')}
            className={HeaderToolbarStyles.addTaskButton}
            aria-label={t('tasks.create')}
          >
            <AddTaskIcon />
            <span className={HeaderToolbarStyles.addTaskText}>
              {t('tasks.newTask')}
            </span>
          </button>

          {/* View Controls (Desktop) */}
          {showViewControls && (
            <ViewControls
              currentView={currentView}
              onViewChange={onViewChange}
              currentFilter={currentFilter}
              onFilterChange={onFilterChange}
            />
          )}

          {/* Theme Toggle */}
          <ThemeToggle variant="toggle" />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notifications */}
          <div className={HeaderToolbarStyles.notificationWrapper}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={HeaderToolbarStyles.iconButton}
              aria-expanded={showNotifications}
              aria-label={`Notifications${
                notificationCount > 0 ? `, ${notificationCount} unread` : ''
              }`}
            >
              <NotificationsIcon />
              {notificationCount > 0 && (
                <span className={HeaderToolbarStyles.notificationBadge}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            )}
          </div>

          {/* User Menu */}
          <UserMenu user={user} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}

export default HeaderToolbar;
