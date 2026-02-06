/**
 * ============================================================================
 * TagItem Component
 * Individual tag navigation item with delete functionality
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
import { useNavigation } from '../../../context/NavigationContext';

export interface TagItemData {
  id: number;
  name: string;
  color: string;
}

interface TagItemProps {
  tag: TagItemData;
  collapsed: boolean;
  onClick: () => void;
  onDelete: () => void;
}

/**
 * TagItem Component
 * Automatically detects active state from navigation context
 */
const TagItem: React.FC<TagItemProps> = ({
  tag,
  collapsed,
  onClick,
  onDelete,
}): React.ReactNode => {
  const { isActive } = useNavigation();
  
  // Determine if this tag is currently active
  const active = isActive('tag', `tag-${tag.id}`);

  const content = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: collapsed ? 1 : 0,
        py: 0.5,
        cursor: 'pointer',
        borderRadius: 1,
        transition: 'all 0.15s ease',
        bgcolor: active ? 'action.selected' : 'transparent',
        borderLeft: active ? '3px solid' : '3px solid transparent',
        borderLeftColor: active ? tag.color : 'transparent',
        '&:hover': {
          bgcolor: active ? 'action.selected' : 'action.hover',
        },
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
      aria-label={tag.name}
    >
      {/* Color dot */}
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: active ? tag.color : `${tag.color}80`,
          flexShrink: 0,
        }}
      />

      {/* Tag name */}
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
          {tag.name}
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
          aria-label={`Delete ${tag.name}`}
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Box>
  );

  if (collapsed) {
    return (
      <Tooltip title={tag.name} placement="right">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
          {content}
        </Box>
      </Tooltip>
    );
  }

  return content;
};

export default TagItem;
