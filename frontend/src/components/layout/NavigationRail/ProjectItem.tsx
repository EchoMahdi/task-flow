/**
 * ============================================================================
 * ProjectItem Component
 * Individual project navigation item with favorite toggle
 * ============================================================================
 */

import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
} from '@mui/material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useNavigation } from '../../../context/NavigationContext';

export interface ProjectItemData {
  id: number;
  name: string;
  color: string;
  icon: string;
  task_count: number;
  is_favorite: boolean;
}

interface ProjectItemProps {
  project: ProjectItemData;
  collapsed: boolean;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

/**
 * Get icon emoji by name
 */
const getIconEmoji = (iconName: string): string => {
  const icons: Record<string, string> = {
    folder: '📁',
    star: '⭐',
    heart: '❤️',
    work: '💼',
    home: '🏠',
    code: '💻',
    book: '📚',
    plane: '✈️',
    music: '🎵',
    game: '🎮',
  };
  return icons[iconName] || '📁';
};

/**
 * ProjectItem Component
 * Automatically detects active state from navigation context
 */
const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  collapsed,
  onClick,
  onToggleFavorite,
}): React.ReactNode => {
  const muiTheme = useMUITheme();
  const { isActive } = useNavigation();
  const favoriteColor = muiTheme.palette.warning.main;
  const secondaryColor = muiTheme.palette.text.secondary;
  
  // Determine if this project is currently active
  const active = isActive('project', `project-${project.id}`);

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
      aria-label={`${project.name}, ${project.task_count} tasks`}
    >
      {/* Project Icon */}
      <Box
        sx={{
          width: 'var(--theme-nav-icon-size, 28px)',
          height: 'var(--theme-nav-icon-size, 28px)',
          borderRadius: 1,
          bgcolor: active ? project.color : `${project.color}80`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--theme-font-size-base, 16px)',
          flexShrink: 0,
        }}
      >
        {getIconEmoji(project.icon)}
      </Box>

      {/* Project Name */}
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
          {project.name}
        </Typography>
      )}

      {/* Task Count */}
      {!collapsed && project.task_count > 0 && (
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            bgcolor: 'grey.200',
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            fontSize: 'var(--theme-font-size-xs, 11px)',
          }}
        >
          {project.task_count}
        </Typography>
      )}

      {/* Favorite Toggle */}
      {!collapsed && (
        <IconButton
          size="small"
          onClick={onToggleFavorite}
          sx={{
            width: 'var(--theme-nav-icon-size, 24px)',
            height: 'var(--theme-nav-icon-size, 24px)',
            opacity: project.is_favorite ? 1 : 0,
            '&:hover': {
              opacity: 1,
            },
          }}
          aria-label={project.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {project.is_favorite ? (
            <StarIcon sx={{ color: favoriteColor, fontSize: 'var(--theme-nav-icon-size, 18px)' }} />
          ) : (
            <StarBorderIcon sx={{ color: secondaryColor, fontSize: 'var(--theme-nav-icon-size, 18px)' }} />
          )}
        </IconButton>
      )}
    </Box>
  );

  if (collapsed) {
    return (
      <Tooltip title={`${project.name} (${project.task_count} tasks)`} placement="right">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 0.5,
          }}
        >
          {content}
        </Box>
      </Tooltip>
    );
  }

  return content;
};

export default ProjectItem;
