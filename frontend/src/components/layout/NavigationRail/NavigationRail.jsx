import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { useTheme as useMUITheme } from "@mui/material/styles";
import { useAuthStore } from "@/stores/authStore";
import { useUser,useAuthActions } from "@/stores/authStore";
import { useNavigationStore } from "@/stores/navigationStore";
import {
  navigationStorage,
  NAV_STORAGE_KEYS,
} from "@/utils/navigationStorage";
import NavigationSkeleton from "./NavigationSkeleton";
import NavigationError from "./NavigationError";
import ProjectsSection from "./ProjectsSection";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FilterListIcon from "@mui/icons-material/FilterList";
import InboxIcon from "@mui/icons-material/Inbox";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DateRangeIcon from "@mui/icons-material/DateRange";
import StarIcon from "@mui/icons-material/Star";
import FolderIcon from "@mui/icons-material/Folder";
import LabelIcon from "@mui/icons-material/Label";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import "./NavigationRail.css";
import { useI18nStore } from "@/stores/i18nStore";

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
  const t = useI18nStore((state) => state.t);
  const muiTheme = useMUITheme();
  const favoriteColor = muiTheme.palette.warning.main;
  const secondaryColor = muiTheme.palette.text.secondary;

  const translatedLabel = t(label);

  const itemContent = (
    <div
      className={["nav-item", active && "nav-item--active"]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={translatedLabel}
      style={color ? { "--item-color": color } : undefined}
    >
      <Icon className="nav-item__icon" style={color ? { color } : undefined} />

      {!collapsed && <span className="nav-item__label">{translatedLabel}</span>}

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
          aria-label={
            isFavorite ? t("Remove from favorites") : t("Add to favorites")
          }
        >
          {loading ? (
            <CircularProgress size={16} />
          ) : isFavorite ? (
            <FavoriteIcon fontSize="small" sx={{ color: favoriteColor }} />
          ) : (
            <FavoriteBorderIcon
              fontSize="small"
              sx={{ color: secondaryColor }}
            />
          )}
        </IconButton>
      )}
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip title={translatedLabel} placement="right">
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
  addLabel = "Add",
  storageKey,
}) => {
  const t = useI18nStore((state) => state.t);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const initialized = useRef(false);

  useEffect(() => {
    if (storageKey && !initialized.current) {
      initialized.current = true;
      const saved = navigationStorage.get(storageKey);
      if (typeof saved === "boolean") setIsExpanded(saved);
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey && initialized.current) {
      navigationStorage.set(storageKey, isExpanded);
    }
  }, [isExpanded, storageKey]);

  const translatedTitle = t(title);
  const translatedAddLabel = t(addLabel);

  if (collapsed) {
    return <div className="nav-section">{children}</div>;
  }

  return (
    <div className="nav-section">
      <button
        className="nav-section__header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={translatedTitle}
      >
        <Icon className="nav-section__icon" />
        <span className="nav-section__title">{translatedTitle}</span>
        <ExpandMoreIcon
          className={[
            "nav-section__chevron",
            isExpanded && "nav-section__chevron--expanded",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </button>

      {isExpanded && <div className="nav-section__content">{children}</div>}

      {onAdd && (
        <button className="nav-item nav-item--add" onClick={onAdd}>
          <AddIcon className="nav-item__icon" />
          <span className="nav-item__label">{translatedAddLabel}</span>
        </button>
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
    formatlistbulleted: FormatListBulletedIcon,
    calendartoday: CalendarTodayIcon,
    checkcircle: CheckCircleIcon,
    schedule: ScheduleIcon,
    daterange: DateRangeIcon,
    folder: FolderIcon,
    label: LabelIcon,
    viewlist: ViewListIcon,
  };
  return icons[iconName] || FormatListBulletedIcon;
};

/**
 * Get count for a filter type
 */
const getCount = (counts, filterId) => counts?.[filterId] || 0;

/**
 * NavigationRail Component
 */
const NavigationRail = ({ collapsed = false, onNavigate }) => {
  const t = useI18nStore((state) => state.t);
  const user = useUser();
  const logout = useAuthActions().logout;

  // Use Zustand store with selectors for optimal re-renders
  const systemFilters = useNavigationStore((state) => state.systemFilters);
  const projects = useNavigationStore((state) => state.projects);
  const favorites = useNavigationStore((state) => state.favorites);
  const tags = useNavigationStore((state) => state.tags);
  const savedViews = useNavigationStore((state) => state.savedViews);
  const counts = useNavigationStore((state) => state.counts);
  const loading = useNavigationStore((state) => state.loading);
  const error = useNavigationStore((state) => state.error);
  const sectionLoading = useNavigationStore((state) => state.sectionLoading);
  const fetchNavigationData = useNavigationStore((state) => state.fetchNavigationData);
  const addProject = useNavigationStore((state) => state.addProject);
  const toggleProjectFavorite = useNavigationStore((state) => state.toggleProjectFavorite);
  const setCallbacks = useNavigationStore((state) => state.setCallbacks);

  const [activeItem, setActiveItem] = useState("inbox");
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Set up callbacks and fetch navigation data on mount
  useEffect(() => {
    setCallbacks({
      on401: () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      },
      onError: (message) => {
        setErrorMessage(message);
        setShowError(true);
      },
    });
    fetchNavigationData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore active view from localStorage on mount
  useEffect(() => {
    const savedView = navigationStorage.get(NAV_STORAGE_KEYS.ACTIVE_VIEW);
    if (savedView) setActiveItem(savedView);
  }, []);

  const handleItemClick = useCallback(
    (itemId, filterData = null) => {
      setActiveItem(itemId);
      navigationStorage.set(NAV_STORAGE_KEYS.ACTIVE_VIEW, itemId);
      onNavigate?.(itemId, filterData);
    },
    [onNavigate],
  );

  const handleUserMenuOpen = useCallback((event) => {
    setUserMenuAnchor(event.currentTarget);
  }, []);

  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
  };

  // Loading state with skeleton
  if (loading && !systemFilters?.length) {
    return (
      <nav className="navigation-rail" aria-label={t("Main navigation")}>
        <NavigationSkeleton collapsed={collapsed} />
      </nav>
    );
  }

  // Critical error state
  if (error && !systemFilters?.length) {
    return (
      <nav className="navigation-rail" aria-label={t("Main navigation")}>
        <NavigationError
          message={t("Failed to load navigation")}
          title={t("Error")}
          onRetry={fetchNavigationData}
        />
      </nav>
    );
  }

  return (
    <nav className="navigation-rail" aria-label={t("Main navigation")}>
      {/* Filters */}
      <NavSection
        title="Filters"
        icon={FilterListIcon}
        collapsed={collapsed}
        defaultExpanded={true}
        storageKey={NAV_STORAGE_KEYS.SECTION_FILTERS_EXPANDED}
      >
        {systemFilters?.map((filter) => {
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

      {/* Favorites */}
      {favorites?.length > 0 && !collapsed && (
        <NavSection
          title="Favorites"
          icon={StarIcon}
          collapsed={collapsed}
          defaultExpanded={true}
          storageKey={NAV_STORAGE_KEYS.SECTION_FAVORITES_EXPANDED}
        >
          {favorites.map((project) => (
            <NavItem
              key={`fav-${project.id}`}
              icon={FolderIcon}
              label={project.name}
              badge={project.taskcount > 0 ? project.taskcount : null}
              active={activeItem === `project-${project.id}`}
              collapsed={collapsed}
              color={project.color}
              showFavorite={true}
              isFavorite={true}
              loading={sectionLoading?.favorites === true}
              onToggleFavorite={() => toggleProjectFavorite?.(project.id)}
              onClick={() =>
                handleItemClick(`project-${project.id}`, {
                  projectId: project.id,
                })
              }
            />
          ))}
        </NavSection>
      )}

      {/* Projects (delegated) */}
      <ProjectsSection
        collapsed={collapsed}
        onNavigate={(type, id, params) => handleItemClick(id, params)}
      />

      {/* Saved Views */}
      {savedViews?.length > 0 && (
        <NavSection
          title="Saved Views"
          icon={ViewListIcon}
          collapsed={collapsed}
          defaultExpanded={false}
          storageKey={NAV_STORAGE_KEYS.SECTION_VIEWS_EXPANDED}
        >
          {savedViews.map((view) => {
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

      {/* Tags */}
      {tags?.length > 0 && (
        <NavSection
          title="Tags"
          icon={LabelIcon}
          collapsed={collapsed}
          defaultExpanded={false}
          storageKey={NAV_STORAGE_KEYS.SECTION_TAGS_EXPANDED}
        >
          {tags.map((tag) => (
            <NavItem
              key={tag.id}
              icon={LabelIcon}
              label={tag.name}
              active={activeItem === `tag-${tag.id}`}
              collapsed={collapsed}
              color={tag.color}
              onClick={() =>
                handleItemClick(`tag-${tag.id}`, { tagId: tag.id })
              }
            />
          ))}
        </NavSection>
      )}

      {/* User menu (avatar) */}
      <Box className="nav-user">
        <Tooltip title={t("User menu")} placement="right">
          <IconButton onClick={handleUserMenuOpen} aria-label={t("User menu")}>
            <Avatar src={user?.avatar} alt={user?.name}>
              {!user?.avatar && (user?.name?.[0] || "U")}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
        >
          <MenuItem
            onClick={() => {
              handleUserMenuClose();
              onNavigate?.("profile");
            }}
          >
            <PersonIcon fontSize="small" style={{ marginRight: 8 }} />
            {t("Profile")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleUserMenuClose();
              onNavigate?.("settings");
            }}
          >
            <SettingsIcon fontSize="small" style={{ marginRight: 8 }} />
            {t("Settings")}
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" style={{ marginRight: 8 }} />
            {t("Logout")}
          </MenuItem>
        </Menu>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {t(errorMessage)}
        </Alert>
      </Snackbar>
    </nav>
  );
};

NavigationRail.displayName = "NavigationRail";
export default NavigationRail;
