/**
 * ============================================================================
 * HeaderToolbar Component
 *
 * Professional application header with navigation, search, actions, and controls.
 * Fully integrated with theme, language, notifications, and user state.
 * ============================================================================
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useI18nStore } from "@/stores/i18nStore";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher/LanguageSwitcher";
import { api } from "@/services/authService";
import { useThemeMode, useColors, useSpacing } from "@/theme";
import HeaderToolbarStyles from "./HeaderToolbar.module.css";
import SearchInput from "@/components/ui/SearchInput";
import useTaskSearch from "@/hooks/useTaskSearch";
import {
  CheckBox as LogoIcon,
  Search as SearchIcon,
  Add as AddTaskIcon,
  Notifications as NotificationsIcon,
  LightMode as ThemeLightIcon,
  DarkMode as ThemeDarkIcon,
  Computer as ThemeSystemIcon,
  KeyboardArrowDown as ChevronDownIcon,
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
} from "@mui/icons-material";

// ============================================================================
// Search Component
// ============================================================================
function SearchSection({ onSearch }) {
  const t = useI18nStore((state) => state.t);
  const colors = useColors();
  const navigate = useNavigate();

  const {
    query,
    results,
    loading,
    suggestions,
    setQuery,
    clearSearch,
    fetchSuggestions,
  } = useTaskSearch({ debounceMs: 300, autoSearch: false });

  const handleSubmit = useCallback(
    (searchValue) => {
      if (searchValue.trim()) {
        navigate(`/tasks?search=${encodeURIComponent(searchValue.trim())}`);
      }
    },
    [navigate],
  );

  const handleSuggestionSelect = useCallback(
    (suggestion) => {
      navigate(`/tasks?search=${encodeURIComponent(suggestion)}`);
    },
    [navigate],
  );

  return (
    <div className={HeaderToolbarStyles.searchSection}>
      <SearchInput
        value={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        onClear={clearSearch}
        placeholder={t("Search tasks")}
        loading={loading}
        suggestions={suggestions}
        showSuggestions={true}
        onSuggestionSelect={fetchSuggestions}
        size="medium"
        fullWidth={true}
        ariaLabel={t("Search tasks")}
        style={{
          "--search-bg": colors.background.secondary,
          "--search-border": colors.border.default,
          "--search-placeholder": colors.text.muted,
          "--search-text": colors.text.primary,
          "--search-focus": colors.primary500,
          "--search-focus-ring": colors.primary50020,
          "--search-icon": colors.text.muted,
        }}
      />

      {/* Quick search results dropdown */}
      {results.length > 0 && query && (
        <div className={HeaderToolbarStyles.searchResultsDropdown}>
          <div className={HeaderToolbarStyles.searchResultsHeader}>
            <span>{t("resultsCount", { count: results.length })}</span>
            <button
              onClick={() =>
                navigate(`/tasks?search=${encodeURIComponent(query)}`)
              }
              className={HeaderToolbarStyles.viewAllLink}
            >
              {t("View all results")}
            </button>
          </div>
          {results.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className={HeaderToolbarStyles.searchResultItem}
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              <span className={HeaderToolbarStyles.resultTitle}>
                {task.title}
              </span>
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
function ThemeToggle({ variant = "dropdown" }) {
  const t = useI18nStore((state) => state.t);
  const { mode, setThemeMode, toggleThemeMode, availableModes } =
    useThemeMode();
  const colors = useColors();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const modeIcons = {
    light: ThemeLightIcon,
    dark: ThemeDarkIcon,
    system: ThemeSystemIcon,
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const modeLabels = {
    light: t("Light"),
    dark: t("Dark"),
    system: t("System"),
  };

  if (variant === "toggle") {
    const Icon = mode === "dark" ? ThemeLightIcon : ThemeDarkIcon;
    return (
      <button
        onClick={toggleThemeMode}
        className={HeaderToolbarStyles.iconButton}
        aria-label={t("switchToMode", {
          mode: mode === "dark" ? t("light") : t("dark"),
        })}
        title={t("currentMode", { mode })}
      >
        <Icon />
      </button>
    );
  }

  const CurrentIcon = modeIcons[mode];

  return (
    <div ref={dropdownRef} className={HeaderToolbarStyles.dropdown}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={HeaderToolbarStyles.dropdownTrigger}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t("Theme settings")}
      >
        <span className={HeaderToolbarStyles.triggerIcon}>
          <CurrentIcon />
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
              "--dropdown-bg": colors.surface.default,
              "--dropdown-border": colors.border.default,
            }}
          >
            {availableModes.map((m) => {
              const ModeIcon = modeIcons[m];
              return (
                <button
                  key={m}
                  onClick={() => {
                    setThemeMode(m);
                    setIsOpen(false);
                  }}
                  className={`${HeaderToolbarStyles.dropdownItem} ${mode === m ? HeaderToolbarStyles.active : ""}`}
                >
                  <span className={HeaderToolbarStyles.dropdownItemIcon}>
                    <ModeIcon />
                  </span>
                  <span>{modeLabels[m]}</span>
                  {mode === m && (
                    <span className={HeaderToolbarStyles.checkmark}>
                      <CheckIcon />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Notification Panel Component
// ============================================================================
function NotificationPanel({ onClose }) {
  const t = useI18nStore((state) => state.t);
  const colors = useColors();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format timestamp helper
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "...";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("Just now");
    if (diffMins < 60) return t("minutesAgo", { count: diffMins });
    if (diffHours < 24) return t("hoursAgo", { count: diffHours });
    if (diffDays < 7) return t("daysAgo", { count: diffDays });
    return date.toLocaleDateString();
  };

  // Fetch notifications from real API
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("notifications/history");
        const data = response.data.data;
        const transformedNotifications = data
          .slice(0, 5)
          .map((notification) => ({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            time: formatTimestamp(
              notification.createdat || notification.timestamp,
            ),
            read: notification.read,
            type: notification.type,
          }));
        setNotifications(transformedNotifications);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
        setError(t("Failed to load notifications"));
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Mark all as read via API
  const handleMarkAllRead = async () => {
    try {
      await api.post("notifications/mark-all-read");
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className={HeaderToolbarStyles.dropdownBackdrop} onClick={onClose} />
      <div
        className={HeaderToolbarStyles.notificationPanel}
        style={{
          "--panel-bg": colors.surface.default,
          "--panel-border": colors.border.default,
        }}
        role="dialog"
        aria-label={t("Notifications")}
      >
        <div className={HeaderToolbarStyles.panelHeader}>
          <h3>{t("Notifications")}</h3>
          {unreadCount > 0 && (
            <button
              className={HeaderToolbarStyles.markAllRead}
              onClick={handleMarkAllRead}
            >
              {t("Mark all as read")}
            </button>
          )}
        </div>

        <div className={HeaderToolbarStyles.notificationList}>
          {loading ? (
            <div className={HeaderToolbarStyles.loadingState}>
              {t("Loading notifications")}
            </div>
          ) : notifications.length === 0 ? (
            <div className={HeaderToolbarStyles.emptyState}>
              {t("No notifications")}
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${HeaderToolbarStyles.notificationItem} ${!notification.read ? HeaderToolbarStyles.unread : ""}`}
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
            {t("View all notifications")}
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
  const t = useI18nStore((state) => state.t);
  const colors = useColors();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div ref={dropdownRef} className={HeaderToolbarStyles.userMenu}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={HeaderToolbarStyles.userMenuTrigger}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t("User menu")}
      >
        <div
          className={HeaderToolbarStyles.userAvatar}
          style={{ backgroundColor: colors.primary500 }}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            userInitials
          )}
        </div>
        <div className={HeaderToolbarStyles.userInfo}>
          <span className={HeaderToolbarStyles.userName}>
            {user?.name || t("User")}
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
              "--dropdown-bg": colors.surface.default,
              "--dropdown-border": colors.border.default,
            }}
          >
            {/* User Header */}
            <div className={HeaderToolbarStyles.userMenuHeader}>
              <div
                className={HeaderToolbarStyles.userAvatarLarge}
                style={{ backgroundColor: colors.primary500 }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  userInitials
                )}
              </div>
              <div>
                <strong>{user?.name || t("User")}</strong>
                <span>{user?.email}</span>
              </div>
            </div>

            <div className={HeaderToolbarStyles.dropdownDivider} />

            <a href="/profile" className={HeaderToolbarStyles.dropdownItem}>
              <ProfileIcon />
              <span>{t("Profile")}</span>
            </a>
            <a href="/settings" className={HeaderToolbarStyles.dropdownItem}>
              <SettingsIcon />
              <span>{t("Settings")}</span>
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
              <span>{t("Logout")}</span>
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
  const t = useI18nStore((state) => state.t);
  const colors = useColors();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  const views = [
    { id: "list", icon: ViewListIcon, label: t("List") },
    { id: "board", icon: ViewBoardIcon, label: t("Board") },
  ];

  const filters = [
    { id: "today", label: t("Today"), icon: TodayIcon },
    { id: "upcoming", label: t("Upcoming"), icon: UpcomingIcon },
    { id: "overdue", label: t("Overdue"), icon: OverdueIcon },
  ];

  const sortOptions = [
    { id: "date", label: t("Date") },
    { id: "priority", label: t("Priority") },
    { id: "name", label: t("Name") },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setIsFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setIsSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeFilter = filters.find((f) => f.id === currentFilter);

  return (
    <div className={HeaderToolbarStyles.viewControls}>
      {/* View Toggle */}
      <div
        className={HeaderToolbarStyles.viewToggle}
        role="group"
        aria-label={t("View type")}
      >
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => onViewChange?.(view.id)}
              className={`${HeaderToolbarStyles.viewToggleBtn} ${currentView === view.id ? HeaderToolbarStyles.active : ""}`}
              aria-pressed={currentView === view.id}
              title={view.label}
            >
              <Icon />
            </button>
          );
        })}
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
          <span>{activeFilter ? activeFilter.label : t("Filter")}</span>
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
                "--dropdown-bg": colors.surface.default,
                "--dropdown-border": colors.border.default,
              }}
            >
              {filters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.id}
                    onClick={() => {
                      onFilterChange?.(filter.id);
                      setIsFilterOpen(false);
                    }}
                    className={`${HeaderToolbarStyles.dropdownItem} ${currentFilter === filter.id ? HeaderToolbarStyles.active : ""}`}
                  >
                    <Icon />
                    <span>{filter.label}</span>
                    {currentFilter === filter.id && (
                      <span className={HeaderToolbarStyles.checkmark}>
                        <CheckIcon />
                      </span>
                    )}
                  </button>
                );
              })}
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
          <span>{t("Sort")}</span>
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
                "--dropdown-bg": colors.surface.default,
                "--dropdown-border": colors.border.default,
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
 * @param {Function} props.onAddTask
 * @param {Function} props.onSearch
 * @param {string} props.currentView
 * @param {Function} props.onViewChange
 * @param {string} props.currentFilter
 * @param {Function} props.onFilterChange
 * @param {boolean} props.showViewControls
 * @param {boolean} props.showSearch
 */
export function HeaderToolbar({
  onAddTask,
  onSearch,
  currentView = "list",
  onViewChange,
  currentFilter,
  onFilterChange,
  showViewControls = true,
  showSearch = true,
}) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const t = useI18nStore((state) => state.t);
  const navigate = useNavigate();
  const location = useLocation();
  const colors = useColors();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await api.get("notifications/unread-count");
        setNotificationCount(response.data.count || 0);
      } catch (err) {
        console.error("Failed to fetch notification count", err);
        setNotificationCount(0);
      }
    };
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return t("Dashboard");
    if (path.startsWith("/tasks")) {
      if (path === "/tasks") return t("Tasks");
      if (path.includes("new")) return t("Create Task");
      return t("Task Details");
    }
    if (path === "/notifications") return t("Notifications");
    if (path === "/profile") return t("Profile");
    if (path === "/settings") return t("Settings");
    return t("Task Flow");
  };

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  }, [logout, navigate]);

  return (
    <header
      className={HeaderToolbarStyles.header}
      style={{
        "--header-bg": colors.background.primary,
        "--header-border": colors.border.default,
        "--header-text": colors.text.primary,
      }}
      role="banner"
    >
      <div className={HeaderToolbarStyles.container}>
        {/* Left Section */}
        <div className={HeaderToolbarStyles.sectionLeft}>
          {/* Mobile Menu Toggle */}
          <button
            className={HeaderToolbarStyles.iconButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t("Toggle menu")}
            style={{ display: "none" }}
          >
            <MenuIcon />
          </button>

          {/* Logo */}
          <a
            href="/dashboard"
            className={HeaderToolbarStyles.logo}
            onClick={(e) => {
              e.preventDefault();
              navigate("/dashboard");
            }}
            aria-label={t("Go to Dashboard")}
          >
            <LogoIcon />
            <span className={HeaderToolbarStyles.logoText}>
              {t("Task Flow")}
            </span>
          </a>

          {/* Page Title */}
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

        {/* Right Section */}
        <div className={HeaderToolbarStyles.sectionRight}>
          {/* Add Task Button */}
          <button
            onClick={() =>
              onAddTask?.onAddTask
                ? onAddTask.onAddTask()
                : navigate("/app/tasks/new")
            }
            className={HeaderToolbarStyles.addTaskButton}
            aria-label={t("Add new task")}
          >
            <AddTaskIcon />
            <span className={HeaderToolbarStyles.addTaskText}>
              {t("Add Task")}
            </span>
          </button>

          {/* View Controls */}
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
              aria-label={
                notificationCount > 0
                  ? t("notificationsWithCount", { count: notificationCount })
                  : t("Notifications")
              }
            >
              <NotificationsIcon />
              {notificationCount > 0 && (
                <span className={HeaderToolbarStyles.notificationBadge}>
                  {notificationCount > 9 ? "9+" : notificationCount}
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
