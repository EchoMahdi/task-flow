/**
 * ============================================================================
 * TagItem Component
 * Individual tag navigation item with delete functionality
 * ============================================================================
 */

import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigationStore } from '@/stores/navigationStore';
import { useI18nStore } from '@/stores/i18nStore';

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
 * Automatically detects active state from navigation store
 */
const TagItem: React.FC<TagItemProps> = ({
  tag,
  collapsed,
  onClick,
  onDelete,
}): React.ReactNode => {
  const t = useI18nStore((state) => state.t);
  const isActive = useNavigationStore((state) => state.isActive);

  const active = isActive('tag', `tag-${tag.id}`);

  const content = (
    <Box
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      role="button"
      tabIndex={0}
      aria-current={active ? 'page' : undefined}
      aria-label={tag.name}
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
      {/* Color dot */}
      <Box
        component="span"
        aria-hidden="true"
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: tag.color,
          flexShrink: 0,
        }}
      />

      {/* Tag name */}
      {!collapsed && (
        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
          {tag.name}
        </Typography>
      )}

      {/* Delete button (visible on hover) */}
      {!collapsed && (
        <Tooltip title={t('deleteTagTooltip', { name: tag.name })} placement="top">
          <IconButton
            className="delete-btn"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={t('deleteTagAriaLabel', { name: tag.name })}
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
      <Tooltip title={tag.name} placement="right">
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default TagItem;
