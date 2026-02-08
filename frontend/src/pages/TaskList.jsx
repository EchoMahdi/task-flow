import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/index';
import { 
  Card, 
  CardContent, 
  Chip, 
  Button, 
  Skeleton, 
  Box, 
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  FormControl,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import  useTasks  from '../hooks/useTasks';

const TaskList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL params
  const initialFilters = {
    status: searchParams.get('status') || 'all',
    priority: searchParams.get('priority') || 'all',
    search: searchParams.get('search') || '',
    sort_by: searchParams.get('sort_by') || 'created_at',
    sort_order: searchParams.get('sort_order') || 'desc',
    per_page: searchParams.get('per_page') || '10',
    project_id: searchParams.get('project_id') || null,
    tag_id: searchParams.get('tag_id') || null,
    filter: searchParams.get('filter') || null,
  };
  
  // Use optimized useTasks hook
  const {
    tasks,
    loading,
    pagination,
    filters,
    fetchTasks,
    refreshTasks,
    updateFilters,
    goToPage,
    deleteTask,
    toggleTask,
  } = useTasks({
    initialFilters,
    autoFetch: true,
    cacheTTL: 30000,
  });
  
  // Debounce ref for search
  const searchTimeoutRef = useRef(null);
  
  // Update filters with URL sync
  const handleFilterChange = useCallback((key, value) => {
    updateFilters({ [key]: value });
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === 'desc' || value === '10' || value === null || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  }, [updateFilters, searchParams, setSearchParams]);
  
  // Debounced search handler
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Update filters immediately for UI
    updateFilters({ search: value });
    
    // Debounce actual fetch
    searchTimeoutRef.current = setTimeout(() => {
      updateFilters({ search: value });
    }, 300);
  }, [updateFilters]);
  
  const handleSearchClear = useCallback(() => {
    updateFilters({ search: '' });
  }, [updateFilters]);
  
  const handleDelete = useCallback(async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }, [deleteTask]);
  
  const handleStatusToggle = useCallback(async (task) => {
    try {
      await toggleTask(task);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  }, [toggleTask]);

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'success',
    };
    return <Chip color={colors[priority] || 'default'} label={priority} />;
  };

  const getStatusBadge = (isCompleted) => {
    return isCompleted ? (
      <Chip color="success" label="Completed" />
    ) : (
      <Chip color="default" label="Pending" />
    );
  };

  const getDueDateInfo = (dueDate, isCompleted) => {
    if (!dueDate) return { text: 'No date', sx: { color: 'text.secondary', fontSize: '0.875rem' } };
    
    const due = new Date(dueDate);
    const today = new Date();
    const isOverdue = due < today && !isCompleted;
    
    if (isOverdue) {
      return { 
        text: due.toLocaleDateString(), 
        sx: { color: 'error.main', fontSize: '0.75rem' } 
      };
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (due.toDateString() === tomorrow.toDateString()) {
      return { text: 'Tomorrow', sx: { color: 'warning.main', fontSize: '0.75rem' } };
    }
    
    if (due.toDateString() === today.toDateString()) {
      return { text: 'Today', sx: { color: 'primary.main', fontSize: '0.75rem' } };
    }
    
    return { text: due.toLocaleDateString(), sx: { color: 'text.secondary', fontSize: '0.875rem' } };
  };

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const sortOptions = [
    { value: 'created_at-desc', label: 'Newest First' },
    { value: 'created_at-asc', label: 'Oldest First' },
    { value: 'due_date-asc', label: 'Due Date (Soon)' },
    { value: 'due_date-desc', label: 'Due Date (Later)' },
    { value: 'priority-desc', label: 'Priority (High)' },
    { value: 'priority-asc', label: 'Priority (Low)' },
  ];

  const perPageOptions = [
    { value: '10', label: '10 per page' },
    { value: '25', label: '25 per page' },
    { value: '50', label: '50 per page' },
    { value: '100', label: '100 per page' },
  ];

  // Get current filter label for header
  const getFilterLabel = () => {
    if (filters.filter === 'inbox') return 'Inbox';
    if (filters.filter === 'completed') return 'Completed';
    if (filters.project_id) return 'Project Tasks';
    if (filters.tag_id) return 'Tagged Tasks';
    return 'All Tasks';
  };

  // Handle page change
  const handlePageChange = useCallback((event, newPage) => {
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
    
    // Use goToPage from hook
    goToPage(newPage);
  }, [goToPage, searchParams, setSearchParams]);

  return (
    <AppLayout fetchTasks={fetchTasks}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'fadeIn 0.3s ease-in-out' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {getFilterLabel()}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {pagination.total} tasks total
            </Typography>
          </Box>
          <Link to="/tasks/new">
            <Button variant="contained" startIcon={<AddIcon />}>
              New Task
            </Button>
          </Link>
        </Box>

        {/* Filters */}
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Search */}
            <Box sx={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <SearchIcon sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'text.secondary', zIndex: 1 }} />
                <TextField
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search || ''}
                  onChange={handleSearchChange}
                  sx={{ width: '100%', '& .MuiOutlinedInput-root': { pl: 5, pr: 1 } }}
                  size="small"
                  variant="outlined"
                />
                {filters.search && (
                  <CloseIcon 
                    sx={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'text.primary' } }}
                    onClick={handleSearchClear}
                  />
                )}
              </Box>
            </Box>

            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                displayEmpty
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Priority Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filters.priority || 'all'}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                displayEmpty
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sort */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={`${filters.sort_by || 'created_at'}-${filters.sort_order || 'desc'}`}
                onChange={(e) => {
                  const [sort_by, sort_order] = e.target.value.split('-');
                  handleFilterChange('sort_by', sort_by);
                  handleFilterChange('sort_order', sort_order);
                }}
                displayEmpty
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Per Page */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={filters.per_page || '10'}
                onChange={(e) => handleFilterChange('per_page', e.target.value)}
                displayEmpty
              >
                {perPageOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Card>

        {/* Task List */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                    <Skeleton variant="circular" width={20} height={20} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="30%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="rounded" width={64} height={24} />
                  </Box>
                ))}
              </Box>
            ) : tasks.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <FormatListBulletedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tasks found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Get started by creating your first task.
                </Typography>
                <Link to="/tasks/new">
                  <Button variant="contained" startIcon={<AddIcon />}>
                    Create Task
                  </Button>
                </Link>
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ width: '100%' }}>
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell sx={{ px: 3, py: 2, textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                        <input
                          type="checkbox"
                          style={{ borderRadius: 4, cursor: 'pointer' }}
                          aria-label="Select all tasks"
                        />
                      </TableCell>
                      <TableCell sx={{ px: 3, py: 2, textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                        Task
                      </TableCell>
                      <TableCell sx={{ px: 3, py: 2, textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ px: 3, py: 2, textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                        Priority
                      </TableCell>
                      <TableCell sx={{ px: 3, py: 2, textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                        Due Date
                      </TableCell>
                      <TableCell sx={{ px: 3, py: 2, textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', width: 100 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ '& .MuiTableRow-root': { borderBottom: 1, borderColor: 'divider' } }}>
                    {tasks.map((task, index) => {
                      const dueDateInfo = getDueDateInfo(task.due_date, task.is_completed);
                      return (
                        <TableRow 
                          key={task.id} 
                          sx={{ 
                            '&:hover': { bgcolor: 'action.hover' },
                            transition: 'background-color 0.15s ease-in-out',
                            animation: `fadeIn 0.3s ease-in-out ${index * 30}ms`
                          }}
                        >
                          <TableCell sx={{ px: 3, py: 2 }}>
                            <input
                              type="checkbox"
                              checked={task.is_completed}
                              onChange={() => handleStatusToggle(task)}
                              style={{ borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s ease-in-out' }}
                              aria-label={`Mark task "${task.title}" as ${task.is_completed ? 'incomplete' : 'completed'}`}
                            />
                          </TableCell>
                          <TableCell sx={{ px: 3, py: 2 }}>
                            <Link
                              to={`/tasks/${task.id}`}
                              style={{ 
                                display: 'block',
                                transition: 'color 0.15s ease-in-out',
                                color: task.is_completed ? 'text.secondary' : 'text.primary',
                                textDecoration: task.is_completed ? 'line-through' : 'none'
                              }}
                            >
                              <Typography sx={{ fontWeight: 500 }}>{task.title}</Typography>
                            </Link>
                            {task.description && (
                              <Typography variant="body2" sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300, mt: 0.5 }}>
                                {task.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ px: 3, py: 2 }}>
                            {getStatusBadge(task.is_completed)}
                          </TableCell>
                          <TableCell sx={{ px: 3, py: 2 }}>
                            {getPriorityBadge(task.priority)}
                          </TableCell>
                          <TableCell sx={{ px: 3, py: 2 }}>
                            <Typography sx={dueDateInfo.sx}>
                              {dueDateInfo.text}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ px: 3, py: 2, textAlign: 'right' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Link
                                to={`/tasks/${task.id}/edit`}
                                style={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 32,
                                  height: 32,
                                  borderRadius: 4,
                                  transition: 'all 0.15s ease-in-out',
                                  color: 'text.secondary',
                                }}
                                aria-label={`Edit task "${task.title}"`}
                              >
                                <EditIcon fontSize="small" />
                              </Link>
                              <button
                                onClick={() => handleDelete(task.id)}
                                style={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 32,
                                  height: 32,
                                  borderRadius: 4,
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease-in-out',
                                  color: 'text.secondary',
                                }}
                                aria-label={`Delete task "${task.title}"`}
                              >
                                <DeleteIcon fontSize="small" />
                              </button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {pagination.last_page > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, gap: 1 }}>
                    <IconButton
                      onClick={(e) => handlePageChange(e, pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      size="small"
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                    <Typography variant="body2" sx={{ mx: 1 }}>
                      Page {pagination.current_page} of {pagination.last_page}
                    </Typography>
                    <IconButton
                      onClick={(e) => handlePageChange(e, pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      size="small"
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </AppLayout>
  );
};

export default TaskList;
