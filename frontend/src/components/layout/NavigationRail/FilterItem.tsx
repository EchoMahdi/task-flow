/**
 * ============================================================================
 * FilterItem Component
 * Individual filter navigation item
 * ============================================================================
 */

import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigation } from '../../../context/NavigationContext';

export interface FilterData {
  id: string;
  name: string;
  icon: string;
  params: Record<string, unknown>;
}

interface FilterItemProps {
  filter: FilterData;
  collapsed: boolean;
  onClick: () => void;
}

/**
 * Get icon component by name
 */
const getIconByName = (iconName: string) => {
  const icons: Record<string, React.ComponentType<{ sx?: React.CSSProperties }>> = {
    inbox: InboxIcon,
    list: FormatListBulletedIcon,
    check: CheckCircleIcon,
  };
  return icons[iconName] || FormatListBulletedIcon;
};

/**
 * FilterItem Component
 * Automatically detects active state from navigation context
 */
const FilterItem: React.FC<FilterItemProps> = ({
  filter,
  collapsed,
  onClick,
}): React.ReactNode => {
  const { isActive } = useNavigation();
  
  // Determine if this filter is currently active
  const active = isActive('filter', filter.id);

  const Icon = getIconByName(filter.icon);

  const content = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: collapsed ? 1 : 0,
        py: 0.75,
        cursor: 'pointer',
        borderRadius: 1,
        transition: 'all 0.15s ease',
        bgcolor: active ? 'action.selected' : 'transparent',
        borderLeft: active ? '3px solid' : '3px solid transparent',
        borderLeftColor: active ? 'primary.main' : 'transparent',
        '&:hover': {
          bgcolor: active ? 'action.selected' : 'action.hover',
        },
        '&:active': {
          bgcolor: 'action.selected',
        },
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
      aria-label={filter.name}
    >
      <Icon
        sx={{
          fontSize: 'var(--theme-nav-icon-size, 20px)',
          color: active ? 'primary.main' : 'text.secondary',
          flexShrink: 0,
        }}
      />
      {!collapsed && (
        <Typography
          variant="body2"
          sx={{
            fontWeight: active ? 600 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {filter.name}
        </Typography>
      )}
    </Box>
  );

  if (collapsed) {
    return (
      <Tooltip title={filter.name} placement="right">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
          {content}
        </Box>
      </Tooltip>
    );
  }

  return content;
};

export default FilterItem;
