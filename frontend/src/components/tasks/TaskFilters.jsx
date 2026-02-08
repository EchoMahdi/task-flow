import React, { useState, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import useTaskSearch from '@/hooks/useTaskSearch';

function TaskFilters({ tags, filters: initialFilters = {}, onFilterChange, onSearchResults }) {
  const [search, setSearch] = useState('');
  
  // Use the production-ready search hook for real backend search
  const {
    results,
    loading,
    total,
    setQuery,
    clearSearch,
    updateFilters,
  } = useTaskSearch({
    debounceMs: 300,
    autoSearch: false,
  });

  // Pass search results back to parent when they change
  useEffect(() => {
    onSearchResults?.(results);
  }, [results, onSearchResults]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearch(value);
    setQuery(value);
    
    // Update parent filters with search
    const updatedFilters = { ...initialFilters };
    if (value.trim()) {
      updatedFilters.search = value.trim();
    } else {
      delete updatedFilters.search;
    }
    onFilterChange(updatedFilters);
  }, [initialFilters, onFilterChange, setQuery]);

  const handlePriorityChange = useCallback((e) => {
    const value = e.target.value;
    const updatedFilters = { ...initialFilters };
    if (value) {
      updatedFilters.priority = value;
    } else {
      delete updatedFilters.priority;
    }
    onFilterChange(updatedFilters);
  }, [initialFilters, onFilterChange]);

  const handleStatusChange = useCallback((e) => {
    const value = e.target.value;
    const updatedFilters = { ...initialFilters };
    if (value === '') {
      delete updatedFilters.is_completed;
    } else {
      updatedFilters.is_completed = value === 'true';
    }
    onFilterChange(updatedFilters);
  }, [initialFilters, onFilterChange]);

  const handleTagChange = useCallback((e) => {
    const value = e.target.value;
    const updatedFilters = { ...initialFilters };
    if (value) {
      updatedFilters.tag_id = value;
    } else {
      delete updatedFilters.tag_id;
    }
    onFilterChange(updatedFilters);
  }, [initialFilters, onFilterChange]);

  const clearFilters = useCallback(() => {
    setSearch('');
    clearSearch();
    onFilterChange({});
  }, [clearSearch, onFilterChange]);

  const hasFilters = search || initialFilters.priority || initialFilters.is_completed !== undefined || initialFilters.tag_id;

  // Sync search with initial filters
  useEffect(() => {
    if (initialFilters.search && initialFilters.search !== search) {
      setSearch(initialFilters.search);
    }
  }, [initialFilters.search]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Filters
          {loading && (
            <CircularProgress size={16} sx={{ ml: 2, verticalAlign: 'middle' }} />
          )}
          {total > 0 && (
            <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
              ({total} results)
            </Typography>
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ position: 'relative' }}>
            <TextField
              label="Search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
            {loading && (
              <CircularProgress 
                size={16} 
                sx={{ 
                  position: 'absolute', 
                  right: 40, 
                  top: '50%', 
                  transform: 'translateY(-50%)' 
                }} 
              />
            )}
          </Box>
          
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={initialFilters.priority || ''}
              onChange={handlePriorityChange}
              label="Priority"
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={
                initialFilters.is_completed === undefined
                  ? ''
                  : initialFilters.is_completed
                  ? 'true'
                  : 'false'
              }
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="">All Tasks</MenuItem>
              <MenuItem value="false">Incomplete</MenuItem>
              <MenuItem value="true">Completed</MenuItem>
            </Select>
          </FormControl>
          
          {tags.length > 0 && (
            <FormControl fullWidth size="small">
              <InputLabel>Tag</InputLabel>
              <Select
                value={initialFilters.tag_id || ''}
                onChange={handleTagChange}
                label="Tag"
              >
                <MenuItem value="">All Tags</MenuItem>
                {tags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          {hasFilters && (
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
              fullWidth
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default TaskFilters;
