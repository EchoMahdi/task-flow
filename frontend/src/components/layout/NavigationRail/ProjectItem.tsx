/**
 * ============================================================================
 * ProjectItem Component
 * Individual project navigation item with favorite toggle
 * ============================================================================
 */

import React from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useNavigation } from '@/context/NavigationContext';
import { useTranslation } from '@/context/I18nContext';

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
  const { t } = useTranslation();
  const muiTheme = useMUITheme();
  const { isActive } = useNavigation();

  const favoriteColor = muiTheme.palette.warning.main;
  const secondaryColor = muiTheme.palette.text.secondary;

  const active = isActive('project', `project-${project.id}`);

  const ariaLabel = t('projectItemAriaLabel', {
    name: project.name,
    count: project.task_count,
  });

  const content = (
    <Box
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      role="button"
      tabIndex={0}
      aria-current={active ? 'page' : undefined}
      aria-label={ariaLabel}
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
      {/* Project Icon */}
      <Box
        component="span"
        aria-hidden="true"
        sx={{ width: 22, display: 'inline-flex', justifyContent: 'center' }}
      >
        {getIconEmoji(project.icon)}
      </Box>

      {/* Project Name */}
      {!collapsed && (
        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
          {project.name}
        </Typography>
      )}

      {/* Task Count */}
      {!collapsed && project.task_count > 0 && (
        <Box
          component="span"
          sx={{
            minWidth: 22,
            px: 0.75,
            py: 0.125,
            borderRadius: 999,
            fontSize: 12,
            textAlign: 'center',
            bgcolor: 'action.selected',
            color: 'text.secondary',
          }}
          aria-label={t('tasksCount', { count: project.task_count })}
        >
          {project.task_count}
        </Box>
      )}

      {/* Favorite Toggle */}
      {!collapsed && (
        <Tooltip
          title={project.is_favorite ? t('Remove from favorites') : t('Add to favorites')}
          placement="top"
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            aria-label={
              project.is_favorite ? t('Remove from favorites') : t('Add to favorites')
            }
          >
            {project.is_favorite ? (
              <StarIcon fontSize="small" sx={{ color: favoriteColor }} />
            ) : (
              <StarBorderIcon fontSize="small" sx={{ color: secondaryColor }} />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  if (collapsed) {
    return (
      <Tooltip title={project.name} placement="right">
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default ProjectItem;
