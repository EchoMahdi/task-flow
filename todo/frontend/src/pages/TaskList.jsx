import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../components/layout/index';
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
  MenuItem
} from '@mui/material';
import { Icons } from '../components/ui/Icons';
import { taskService } from '../services/taskService';

const TaskList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    priority: searchParams.get('priority') || 'all',
    search: searchParams.get('search') || '',
    sort_by: searchParams.get('sort_by') || 'created_at',
    sort_order: searchParams.get('sort_order') || 'desc',
    per_page: searchParams.get('per_page') || '10',
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        per_page: filters.per_page,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      };
      
      if (filters.status !== 'all') {
        if (filters.status === 'completed') {
          params.is_completed = true;
        } else if (filters.status === 'pending') {
          params.is_completed = false;
        }
      }
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const data = await taskService.getTasks(params);
      setTasks(data.data || []);
      setPagination(prev => ({
        ...prev,
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
        per_page: data.per_page || 10,
      }));
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === 'desc' || value === '10') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleStatusToggle = async (task) => {
    try {
      const newStatus = !task.is_completed;
      await taskService.updateTask(task.id, { is_completed: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

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

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'fadeIn 0.3s ease-in-out' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>Tasks</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{pagination.total} tasks total</Typography>
          </Box>
          <Link to="/tasks/new">
            <Button variant="contained" startIcon={<Icons.Plus />}>
              New Task
            </Button>
          </Link>
        </Box>

        {/* Filters */}
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Search */}
            <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <Box sx={{ position: 'relative' }}>
                <Icons.Search sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'text.secondary' }} />
                <TextField
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  sx={{ width: '100%', '& .MuiOutlinedInput-root': { pl: 5 } }}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>

            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filters.status}
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
                value={filters.priority}
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
                value={`${filters.sort_by}-${filters.sort_order}`}
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
                value={filters.per_page}
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
              <Box
                icon={<Icons.ClipboardList sx={{ fontSize: 48 }} />}
                title="No tasks found"
                description="Get started by creating your first task."
                action={
                  <Link to="/tasks/new">
                    <Button variant="contained" startIcon={<Icons.Plus />}>
                      Create Task
                    </Button>
                  </Link>
                }
              />
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
                                  padding: 8,
                                  color: 'text.secondary',
                                  transition: 'all 0.15s ease-in-out',
                                  borderRadius: 8
                                }}
                                aria-label={`Edit task "${task.title}"`}
                              >
                                <Icons.Pencil sx={{ fontSize: 16 }} />
                              </Link>
                              <button
                                onClick={() => handleDelete(task.id)}
                                style={{
                                  padding: 8,
                                  color: 'text.secondary',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease-in-out',
                                  borderRadius: 8
                                }}
                                aria-label={`Delete task "${task.title}"`}
                              >
                                <Icons.Trash sx={{ fontSize: 16, color: 'error.main' }} />
                              </button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
              {pagination.total} results
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={pagination.current_page === 1}
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                startIcon={<Icons.ChevronLeft />}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                endIcon={<Icons.ChevronRight />}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default TaskList;
