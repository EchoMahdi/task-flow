/**
 * ============================================================================
 * SavedViewItem Component
 * Individual saved view navigation item
 * ============================================================================
 */

import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useTranslation } from '@/context/I18nContext';

export interface SavedViewItemData {
  id: number;
  name: string;
  display_mode: 'list' | 'calendar';
  filter_conditions?: Record<string, unknown>;
  sort_order?: Record<string, unknown>;
}

interface SavedViewItemProps {
  view: SavedViewItemData;
  collapsed: boolean;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}

/**
 * Get icon by display mode
 */
const getIconByMode = (mode: string) => {
  return mode === 'calendar' ? CalendarTodayIcon : ViewListIcon;
};

/**
 * SavedViewItem Component
 */
const SavedViewItem: React.FC<SavedViewItemProps> = ({
  view,
  collapsed,
  active,
  onClick,
  onDelete,
}) => {
  const { t } = useTranslation();
  const Icon = getIconByMode(view.display_mode);

  const content = (
    <Box
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      role="button"
      tabIndex={0}
      aria-current={active ? 'page' : undefined}
      aria-label={view.name}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.75,
        borderRadius: 1,
        cursor: 'pointer',
        bgcolor: active ? 'action.selected' : 'transparent',
        '&:hover': {
          bgcolor: 'action.hover',
          '& .delete-btn': { opacity: 1 },
        },
      }}
    >
      {/* Display mode icon */}
      <Icon fontSize="small" aria-hidden="true" />

      {/* View name */}
      {!collapsed && (
        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
          {view.name}
        </Typography>
      )}

      {/* Delete button (visible on hover) */}
      {!collapsed && (
        <Tooltip title={t('deleteViewTooltip', { name: view.name })} placement="top">
          <IconButton
            className="delete-btn"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={t('deleteViewAriaLabel', { name: view.name })}
            sx={{
              width: 24,
              height: 24,
              opacity: 0,
              transition: 'opacity 150ms ease',
              '&:hover': {
                bgcolor: 'error.light',
                '& .MuiSvgIcon-root': { color: 'error.main' },
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  if (collapsed) {
    return (
      <Tooltip title={view.name} placement="right">
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default SavedViewItem;
