/**
 * ============================================================================
 * FiltersSection Component
 * Hardcoded system filters section
 * ============================================================================
 */

import React, { useState, useCallback } from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterItem, { FilterData } from './FilterItem';
import { useTranslation } from '@/context/I18nContext';


const FILTERS: FilterData[] = [
  { id: 'inbox', name: 'Inbox', icon: 'inbox', params: { filter: 'inbox' } },
  { id: 'all', name: 'All Tasks', icon: 'list', params: { filter: 'all' } },
  { id: 'completed', name: 'Completed', icon: 'check', params: { filter: 'completed' } },
];

interface FiltersSectionProps {
  collapsed: boolean;
  onNavigate: (navigation: { type: string; params: Record<string, unknown> }) => void;
}

/**
 * Load collapsed state from localStorage
 */
const loadCollapsedState = (key: string, defaultValue: boolean): boolean => {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? defaultValue : stored === 'true';
  } catch {
    return defaultValue;
  }
};

/**
 * Save collapsed state to localStorage
 */
const saveCollapsedState = (key: string, value: boolean): void => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Ignore localStorage errors
  }
};

/**
 * FiltersSection Component
 */
const FiltersSection: React.FC<FiltersSectionProps> = ({ collapsed, onNavigate }) => {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(() =>
    loadCollapsedState('nav_filters_expanded', true)
  );

  const [activeFilterId, setActiveFilterId] = useState('inbox');

  // Save expanded state when it changes
  React.useEffect(() => {
    saveCollapsedState('nav_filters_expanded', expanded);
  }, [expanded]);

  // Handle filter click
  const handleFilterClick = useCallback(
    (filter: FilterData) => {
      setActiveFilterId(filter.id);
      onNavigate({
        type: 'filter',
        params: filter.params,
      });
    },
    [onNavigate]
  );

  // Section header component
  const SectionHeader: React.FC = () => (
    <Box
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        px: collapsed ? 0.5 : 1.5,
        py: 0.75,
        borderRadius: 1,
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      aria-label={t('Filters')}
      aria-expanded={expanded}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FilterListIcon fontSize="small" />
        {!collapsed && (
          <Typography variant="subtitle2" noWrap>
            {t('Filters')}
          </Typography>
        )}
      </Box>

      {!collapsed && (
        <IconButton
          size="small"
          aria-label={expanded ? t('Collapse') : t('Expand')}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <ExpandMoreIcon
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 150ms ease',
            }}
          />
        </IconButton>
      )}
    </Box>
  );

  if (collapsed) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {FILTERS.map((filter) => (
          <FilterItem
            key={filter.id}
            filter={filter}
            collapsed={true}
            onClick={() => handleFilterClick(filter)}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <SectionHeader />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
          {FILTERS.map((filter) => (
            <FilterItem
              key={filter.id}
              filter={filter}
              collapsed={false}
              onClick={() => handleFilterClick(filter)}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default FiltersSection;
