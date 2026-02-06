import React, { useState } from 'react';
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
  Box
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

function TaskFilters({ tags, filters, onFilterChange }) {
  const [search, setSearch] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    onFilterChange({ ...filters, search: value || undefined });
  };

  const handlePriorityChange = (e) => {
    const value = e.target.value;
    onFilterChange({ ...filters, priority: value || undefined });
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      const { is_completed, ...rest } = filters;
      onFilterChange(rest);
    } else {
      onFilterChange({ ...filters, is_completed: value === 'true' });
    }
  };

  const handleTagChange = (e) => {
    const value = e.target.value;
    onFilterChange({ ...filters, tag_id: value || undefined });
  };

  const clearFilters = () => {
    setSearch('');
    onFilterChange({});
  };

  const hasFilters = search || filters.priority || filters.is_completed !== undefined || filters.tag_id;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Filters
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search tasks..."
            fullWidth
            size="small"
          />
          
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority || ''}
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
                filters.is_completed === undefined
                  ? ''
                  : filters.is_completed
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
                value={filters.tag_id || ''}
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
