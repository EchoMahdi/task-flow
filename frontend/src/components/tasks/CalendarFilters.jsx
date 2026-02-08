import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../context/I18nContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FilterListIcon from '@mui/icons-material/FilterList';
import FlagIcon from '@mui/icons-material/Flag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import Typography from '@mui/material/Typography';
import { taskOptionsService } from '../../services/taskOptionsService';

/**
 * CalendarFilters Component
 * 
 * Provides filtering options for the calendar view:
 * - Status filter (all, pending, in_progress, completed)
 * - Priority filter (low, medium, high, urgent)
 * - Include completed toggle
 * - Date range quick filters
 */
const CalendarFilters = ({
  filters,
  onChange,
  availableFormats,
}) => {
  const { t } = useTranslation();
  
  // Menu state
  const [statusAnchor, setStatusAnchor] = useState(null);
  const [priorityAnchor, setPriorityAnchor] = useState(null);
  
  // Options state
  const [statusOptions, setStatusOptions] = useState([]);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch options from API
  // DUPLICATION: Same pattern in TaskModal.jsx and TaskForm.jsx - extract to useTaskOptions hook
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        console.log('[CalendarFilters] DEBUG: Fetching options (DUPLICATED PATTERN)');
        const optionsData = await taskOptionsService.getOptions();
        setStatusOptions(optionsData.data.statuses || []);
        setPriorityOptions(optionsData.data.priorities || []);
      } catch (err) {
        console.error("Failed to fetch task options:", err);
        console.log('[CalendarFilters] DEBUG: Using fallback options (DUPLICATED in TaskModal.jsx, TaskForm.jsx)');
        // Fallback to default options
        setStatusOptions([
          { value: 'pending', label: t('status.pending'), color: 'default' },
          { value: 'in_progress', label: t('status.in_progress'), color: 'primary' },
          { value: 'completed', label: t('status.completed'), color: 'success' },
        ]);
        setPriorityOptions([
          { value: 'low', label: t('priority.low'), color: 'success' },
          { value: 'medium', label: t('priority.medium'), color: 'warning' },
          { value: 'high', label: t('priority.high'), color: 'error' },
          { value: 'urgent', label: t('priority.urgent'), color: 'error' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOptions();
  }, [t]);
  
  // Close menus when clicking outside
  const statusButtonRef = useRef(null);
  const priorityButtonRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusButtonRef.current && !statusButtonRef.current.contains(event.target)) {
        setStatusAnchor(null);
      }
      if (priorityButtonRef.current && !priorityButtonRef.current.contains(event.target)) {
        setPriorityAnchor(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle status toggle
  const handleStatusToggle = (status) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    
    onChange({ ...filters, status: newStatus });
  };
  
  // Handle priority toggle
  const handlePriorityToggle = (priority) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority];
    
    onChange({ ...filters, priority: newPriority });
  };
  
  // Handle include completed toggle
  const handleIncludeCompleted = () => {
    onChange({ ...filters, include_completed: !filters.include_completed });
  };
  
  // Handle reset all filters
  const handleReset = () => {
    onChange({
      status: [],
      priority: [],
      include_completed: false,
    });
  };
  
  // Check if any filters are active
  const hasActiveFilters = 
    filters.status.length > 0 || 
    filters.priority.length > 0 || 
    filters.include_completed;
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'default';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      default: return 'default';
    }
  };
  
  // Get priority color for Chip
  const getPriorityChipColor = (priority) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };
  
  return (
    <Box sx={{ 
      p: 1.5, 
      bgcolor: 'grey.100', 
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {/* Status Filter */}
        <Button
          ref={statusButtonRef}
          variant="outlined"
          size="small"
          startIcon={<FilterListIcon />}
          endIcon={<Chip label={filters.status.length} size="small" color="primary" sx={{ height: 18, fontSize: 11 }} />}
          onClick={(e) => setStatusAnchor(e.currentTarget)}
          sx={{ 
            bgcolor: filters.status.length > 0 ? 'primary.50' : 'background.paper',
            borderColor: filters.status.length > 0 ? 'primary.main' : 'divider',
            color: filters.status.length > 0 ? 'primary.main' : 'text.primary',
            '&:hover': {
              bgcolor: filters.status.length > 0 ? 'primary.100' : 'action.hover',
              borderColor: 'primary.main',
            },
          }}
        >
          {t('filters.status')}
        </Button>
        <Menu
          anchorEl={statusAnchor}
          open={Boolean(statusAnchor)}
          onClose={() => setStatusAnchor(null)}
          PaperProps={{
            sx: { minWidth: 180 }
          }}
        >
          {statusOptions.map((option) => {
            const isSelected = filters.status.includes(option.value);
            return (
              <MenuItem 
                key={option.value} 
                onClick={() => handleStatusToggle(option.value)}
                selected={isSelected}
                sx={{ 
                  py: 1,
                  bgcolor: isSelected ? 'primary.50' : 'background.paper',
                }}
              >
                <Checkbox checked={isSelected} size="small" />
                <Box sx={{ ml: 1 }}>
                  <Chip 
                    label={option.label} 
                    size="small" 
                    color={getStatusColor(option.value)}
                    variant="outlined"
                    sx={{ fontSize: 12 }}
                  />
                </Box>
              </MenuItem>
            );
          })}
        </Menu>
        
        {/* Priority Filter */}
        <Button
          ref={priorityButtonRef}
          variant="outlined"
          size="small"
          startIcon={<FlagIcon />}
          endIcon={<Chip label={filters.priority.length} size="small" color="warning" sx={{ height: 18, fontSize: 11 }} />}
          onClick={(e) => setPriorityAnchor(e.currentTarget)}
          sx={{ 
            bgcolor: filters.priority.length > 0 ? 'warning.50' : 'background.paper',
            borderColor: filters.priority.length > 0 ? 'warning.main' : 'divider',
            color: filters.priority.length > 0 ? 'warning.main' : 'text.primary',
            '&:hover': {
              bgcolor: filters.priority.length > 0 ? 'warning.100' : 'action.hover',
              borderColor: 'warning.main',
            },
          }}
        >
          {t('filters.priority')}
        </Button>
        <Menu
          anchorEl={priorityAnchor}
          open={Boolean(priorityAnchor)}
          onClose={() => setPriorityAnchor(null)}
          PaperProps={{
            sx: { minWidth: 180 }
          }}
        >
          {priorityOptions.map((option) => {
            const isSelected = filters.priority.includes(option.value);
            return (
              <MenuItem 
                key={option.value} 
                onClick={() => handlePriorityToggle(option.value)}
                selected={isSelected}
                sx={{ 
                  py: 1,
                  bgcolor: isSelected ? 'warning.50' : 'background.paper',
                }}
              >
                <Checkbox checked={isSelected} size="small" />
                <FlagIcon sx={{ mr: 1, color: `${option.color}.main`, fontSize: 18 }} />
                <Chip 
                  label={option.label} 
                  size="small" 
                  color={option.color}
                  variant="outlined"
                  sx={{ fontSize: 12 }}
                />
              </MenuItem>
            );
          })}
        </Menu>
        
        {/* Include Completed Toggle */}
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.include_completed}
              onChange={handleIncludeCompleted}
              size="small"
              color="success"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircleIcon fontSize="small" color={filters.include_completed ? 'success' : 'disabled'} />
              <Typography variant="body2">{t('filters.includeCompleted')}</Typography>
            </Box>
          }
          sx={{ ml: 1 }}
        />
        
        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearAllIcon />}
            onClick={handleReset}
            sx={{ color: 'text.secondary', ml: 'auto' }}
          >
            {t('filters.clear')}
          </Button>
        )}
      </Box>
      
      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          {filters.status.map((status) => (
            <Chip
              key={status}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {statusOptions.find((o) => o.value === status)?.label}
                  <CloseIcon sx={{ fontSize: 14 }} onClick={() => handleStatusToggle(status)} />
                </Box>
              }
              size="small"
              color={getStatusColor(status)}
              onDelete={() => handleStatusToggle(status)}
              sx={{ fontSize: 12 }}
            />
          ))}
          
          {filters.priority.map((priority) => (
            <Chip
              key={priority}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {priorityOptions.find((o) => o.value === priority)?.label}
                  <CloseIcon sx={{ fontSize: 14 }} onClick={() => handlePriorityToggle(priority)} />
                </Box>
              }
              size="small"
              color={getPriorityChipColor(priority)}
              onDelete={() => handlePriorityToggle(priority)}
              sx={{ fontSize: 12 }}
            />
          ))}
          
          {filters.include_completed && (
            <Chip
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {t('filters.completedIncluded')}
                  <CloseIcon sx={{ fontSize: 14 }} onClick={handleIncludeCompleted} />
                </Box>
              }
              size="small"
              color="success"
              variant="outlined"
              onDelete={handleIncludeCompleted}
              sx={{ fontSize: 12 }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default CalendarFilters;
