import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../components/layout/index';
import { Card, CardContent, Chip, Button, Skeleton, Box } from '@mui/material';
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
    const variants = {
      high: 'danger',
      medium: 'warning',
      low: 'success',
    };
    return <Chip variant={variants[priority] || 'secondary'}>{priority}</Chip>;
  };

  const getStatusBadge = (isCompleted) => {
    return isCompleted ? (
      <Chip variant="success">Completed</Chip>
    ) : (
      <Chip variant="secondary">Pending</Chip>
    );
  };

  const getDueDateInfo = (dueDate, isCompleted) => {
    if (!dueDate) return { text: 'No date', className: 'text-secondary-400 text-sm' };
    
    const due = new Date(dueDate);
    const today = new Date();
    const isOverdue = due < today && !isCompleted;
    
    if (isOverdue) {
      return { 
        text: due.toLocaleDateString(), 
        className: 'badge-danger text-xs' 
      };
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (due.toDateString() === tomorrow.toDateString()) {
      return { text: 'Tomorrow', className: 'badge-warning text-xs' };
    }
    
    if (due.toDateString() === today.toDateString()) {
      return { text: 'Today', className: 'badge-primary text-xs' };
    }
    
    return { text: due.toLocaleDateString(), className: 'text-secondary-600 text-sm' };
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
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Tasks</h1>
            <p className="text-secondary-500 mt-1">{pagination.total} tasks total</p>
          </div>
          <Link to="/tasks/new">
            <Button icon={<Icons.Plus className="w-4 h-4" />}>
              New Task
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
              <div className="search-input">
                <Icons.Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full"
                />
              </div>
            </form>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="filter-select"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${filters.sort_by}-${filters.sort_order}`}
              onChange={(e) => {
                const [sort_by, sort_order] = e.target.value.split('-');
                handleFilterChange('sort_by', sort_by);
                handleFilterChange('sort_order', sort_order);
              }}
              className="filter-select"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Per Page */}
            <select
              value={filters.per_page}
              onChange={(e) => handleFilterChange('per_page', e.target.value)}
              className="filter-select"
            >
              {perPageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Task List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton variant="card" className="w-5 h-5 rounded" />
                    <div className="flex-1">
                      <Skeleton variant="text" className="w-48 h-5 mb-2" />
                      <Skeleton variant="text" className="w-64 h-4" />
                    </div>
                    <Skeleton variant="card" className="w-20 h-6 rounded-full" />
                    <Skeleton variant="card" className="w-16 h-6 rounded-full" />
                  </div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <Box
                icon={<Icons.ClipboardList className="w-12 h-12" />}
                title="No tasks found"
                description="Get started by creating your first task."
                action={
                  <Link to="/tasks/new">
                    <Button icon={<Icons.Plus className="w-4 h-4" />}>
                      Create Task
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50 border-y border-secondary-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                          aria-label="Select all tasks"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wider w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100">
                    {tasks.map((task, index) => {
                      const dueDateInfo = getDueDateInfo(task.due_date, task.is_completed);
                      return (
                        <tr 
                          key={task.id} 
                          className="hover:bg-secondary-50/50 transition-colors duration-150 animate-fade-in"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={task.is_completed}
                              onChange={() => handleStatusToggle(task)}
                              className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 cursor-pointer transition-all duration-150"
                              aria-label={`Mark task "${task.title}" as ${task.is_completed ? 'incomplete' : 'completed'}`}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              to={`/tasks/${task.id}`}
                              className={`block transition-colors duration-150 ${task.is_completed ? 'text-secondary-500 line-through' : 'text-secondary-900 hover:text-primary-600'}`}
                            >
                              <span className="font-medium">{task.title}</span>
                            </Link>
                            {task.description && (
                              <p className="text-sm text-secondary-500 truncate max-w-md mt-1">
                                {task.description}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(task.is_completed)}
                          </td>
                          <td className="px-6 py-4">
                            {getPriorityBadge(task.priority)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={dueDateInfo.className}>
                              {dueDateInfo.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/tasks/${task.id}/edit`}
                                className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-all duration-150"
                                aria-label={`Edit task "${task.title}"`}
                              >
                                <Icons.Pencil className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="p-2 text-secondary-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all duration-150"
                                aria-label={`Delete task "${task.title}"`}
                              >
                                <Icons.Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-secondary-500">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
              {pagination.total} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.current_page === 1}
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                icon={<Icons.ChevronLeft className="w-4 h-4 mr-1" />}
                iconPosition="left"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
              >
                Next
                <Icons.ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TaskList;
