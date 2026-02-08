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

/**
 * Hardcoded system filters
 */
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
const FiltersSection: React.FC<FiltersSectionProps> = ({
  collapsed,
  onNavigate,
}) => {
  const [expanded, setExpanded] = useState(() =>
    loadCollapsedState('nav_filters_expanded', true)
  );
  const [activeFilterId, setActiveFilterId] = useState<string>('inbox');

  // Save collapsed state when it changes
  React.useEffect(() => {
    saveCollapsedState('nav_filters_expanded', expanded);
  }, [expanded]);

  // Handle filter click
  const handleFilterClick = useCallback((filter: FilterData) => {
    setActiveFilterId(filter.id);
    onNavigate({
      type: 'filter',
      params: filter.params,
    });
  }, [onNavigate]);

  // Section header component
  const SectionHeader: React.FC = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: collapsed ? 1 : 0,
        py: 0.5,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
        borderRadius: 1,
      }}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && setExpanded(!expanded)}
    >
      <Box sx={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
        <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
      </Box>
      <FilterListIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 0.5 }} />
      {!collapsed && (
        <Typography variant="body2" sx={{ flex: 1, ml: 0.5, fontWeight: 500 }}>
          Filters
        </Typography>
      )}
    </Box>
  );

  if (collapsed) {
    return (
      <Box>
        <SectionHeader />
        <Box sx={{ pl: 1 }}>
          {FILTERS.map((filter) => (
            <FilterItem
              key={filter.id}
              filter={filter}
              collapsed={true}
              active={activeFilterId === filter.id}
              onClick={() => handleFilterClick(filter)}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <SectionHeader />
      <Collapse in={expanded}>
        <Box sx={{ pl: 1 }}>
          {FILTERS.map((filter) => (
            <FilterItem
              key={filter.id}
              filter={filter}
              collapsed={false}
              active={activeFilterId === filter.id}
              onClick={() => handleFilterClick(filter)}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default FiltersSection;
