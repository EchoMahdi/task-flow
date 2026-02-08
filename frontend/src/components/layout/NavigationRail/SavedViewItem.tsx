/**
 * ============================================================================
 * SavedViewItem Component
 * Individual saved view navigation item
 * ============================================================================
 */

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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
  const Icon = getIconByMode(view.display_mode);

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
        '&:hover': {
          bgcolor: active ? 'action.selected' : 'action.hover',
        },
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
      aria-label={view.name}
    >
      {/* Display mode icon */}
      <Icon
        sx={{
          fontSize: 20,
          color: active ? 'primary.main' : 'text.secondary',
          flexShrink: 0,
        }}
      />

      {/* View name */}
      {!collapsed && (
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            fontWeight: active ? 600 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {view.name}
        </Typography>
      )}

      {/* Delete button (visible on hover) */}
      {!collapsed && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{
            width: 24,
            height: 24,
            opacity: 0,
            '&:hover': {
              opacity: 1,
              bgcolor: 'error.light',
              '& .MuiSvgIcon-root': {
                color: 'error.main',
              },
            },
          }}
          aria-label={`Delete ${view.name}`}
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Box>
  );

  if (collapsed) {
    return (
      <Tooltip title={view.name} placement="right">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
          {content}
        </Box>
      </Tooltip>
    );
  }

  return content;
};

export default SavedViewItem;
