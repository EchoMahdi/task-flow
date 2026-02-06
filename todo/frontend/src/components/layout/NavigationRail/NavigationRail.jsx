/**
 * ============================================================================
 * NavigationRail Component
 * Left zone navigation with collapsible sections:
 * - User section
 * - Projects
 * - Filters
 * - Saved Views
 * - Tags
 * - Smart Lists
 * ============================================================================
 */

import React, { useState } from 'react';
import { Avatar } from '../../ui/index';
import { useAuth } from '../../../context/AuthContext';
import './NavigationRail.css';
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
import { useTranslation } from '@/mui/icon-material';

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
}) => {
  if (collapsed) {
    return (
      <button
        className={['nav-item', active && 'nav-item--active'].filter(Boolean).join(' ')}
        onClick={onClick}
        aria-label={label}
      >
        <Icon className="nav-item__icon" />
        {badge && <span className="nav-item__badge">{badge}</span>}
      </button>
    );
  }

  return (
    <button
      className={['nav-item', active && 'nav-item--active'].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <Icon className="nav-item__icon" />
      <span className="nav-item__label">{label}</span>
      {badge && <span className="nav-item__badge">{badge}</span>}
    </button>
  );
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
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

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
        </div>
      )}
    </div>
  );
};

/**
 * NavigationRail Component
 * 
 * @param {Object} props
 * @param {boolean} props.collapsed - Whether the nav is collapsed
 * @param {Function} props.onNavigate - Callback when navigation item is clicked
 */
export const NavigationRail = ({
  collapsed = false,
  onNavigate = () => {},
}) => {
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState('inbox');

  // Sample data for navigation
  const projects = [
    { id: 'p1', name: 'Personal', color: '#3b82f6', taskCount: 5 },
    { id: 'p2', name: 'Work', color: '#22c55e', taskCount: 12 },
    { id: 'p3', name: 'Shopping', color: '#f59e0b', taskCount: 3 },
  ];

  const smartLists = [
    { id: 'sl1', name: 'All Tasks', icon: FormatListBulletedIcon, count: 45 },
    { id: 'sl2', name: 'Today', icon: CalendarTodayIcon, count: 8 },
    { id: 'sl3', name: 'Completed', icon: CheckCircleIcon, count: 127 },
  ];

  const tags = [
    { id: 't1', name: 'Urgent', color: '#ef4444' },
    { id: 't2', name: 'Review', color: '#3b82f6' },
    { id: 't3', name: 'Ideas', color: '#8b5cf6' },
  ];

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    onNavigate(itemId);
  };

  return (
    <nav className="navigation-rail" aria-label="Main navigation">
      {/* User Section */}
      <div className="nav-section nav-section--user">
        <div className="nav-user">
          <Avatar
            name={user?.name || 'User'}
            size={collapsed ? 'md' : 'sm'}
            className="nav-user__avatar"
          />
          {!collapsed && (
            <div className="nav-user__info">
              <span className="nav-user__name">{user?.name || 'User'}</span>
              <span className="nav-user__email">{user?.email || 'user@example.com'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <NavSection
        title="Filters"
        icon={FilterListIcon}
        collapsed={collapsed}
        defaultExpanded={true}
      >
        <NavItem
          icon={InboxIcon}
          label="Inbox"
          badge={3}
          active={activeItem === 'inbox'}
          collapsed={collapsed}
          onClick={() => handleItemClick('inbox')}
        />
        <NavItem
          icon={ScheduleIcon}
          label="Overdue"
          badge={5}
          active={activeItem === 'overdue'}
          collapsed={collapsed}
          onClick={() => handleItemClick('overdue')}
        />
        <NavItem
          icon={CalendarTodayIcon}
          label="Today"
          badge={8}
          active={activeItem === 'today'}
          collapsed={collapsed}
          onClick={() => handleItemClick('today')}
        />
        <NavItem
          icon={DateRangeIcon}
          label="Upcoming"
          badge={12}
          active={activeItem === 'upcoming'}
          collapsed={collapsed}
          onClick={() => handleItemClick('upcoming')}
        />
      </NavSection>

      {/* Smart Lists Section */}
      <NavSection
        title="Smart Lists"
        icon={StarIcon}
        collapsed={collapsed}
        defaultExpanded={false}
      >
        {smartLists.map((list) => (
          <NavItem
            key={list.id}
            icon={list.icon}
            label={list.name}
            badge={list.count}
            active={activeItem === list.id}
            collapsed={collapsed}
            onClick={() => handleItemClick(list.id)}
          />
        ))}
      </NavSection>

      {/* Projects Section */}
      <NavSection
        title="Projects"
        icon={FolderIcon}
        collapsed={collapsed}
        defaultExpanded={true}
      >
        {projects.map((project) => (
          <NavItem
            key={project.id}
            icon={FolderIcon}
            label={project.name}
            badge={project.taskCount}
            active={activeItem === project.id}
            collapsed={collapsed}
            onClick={() => handleItemClick(project.id)}
          />
        ))}
        {!collapsed && (
          <button className="nav-item nav-item--add">
            <AddIcon className="nav-item__icon" />
            <span className="nav-item__label">Add Project</span>
          </button>
        )}
      </NavSection>

      {/* Tags Section */}
      <NavSection
        title="Tags"
        icon={LabelIcon}
        collapsed={collapsed}
        defaultExpanded={false}
      >
        {tags.map((tag) => (
          <NavItem
            key={tag.id}
            icon={LabelIcon}
            label={tag.name}
            active={activeItem === tag.id}
            collapsed={collapsed}
            onClick={() => handleItemClick(tag.id)}
          />
        ))}
      </NavSection>

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
    </nav>
  );
};

NavigationRail.displayName = 'NavigationRail';

export default NavigationRail;
