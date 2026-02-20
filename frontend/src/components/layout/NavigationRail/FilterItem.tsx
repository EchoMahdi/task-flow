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
import { useNavigation } from '@/context/NavigationContext';
import { useTranslation } from '@/context/I18nContext';

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
  const icons: Record<string, React.ElementType> = {
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
  const { t } = useTranslation();

  const active = isActive('filter', filter.id);
  const Icon = getIconByName(filter.icon);
  const label = t(filter.name);

  const content = (
    <Box
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={label}
      role="button"
      tabIndex={0}
      aria-current={active ? 'page' : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.75,
        borderRadius: 1,
        cursor: 'pointer',
        bgcolor: active ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Icon fontSize="small" />
      {!collapsed && (
        <Typography variant="body2" noWrap>
          {label}
        </Typography>
      )}
    </Box>
  );

  if (collapsed) {
    return (
      <Tooltip title={label} placement="right">
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default FilterItem;
