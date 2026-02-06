import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/index';
import { Card, CardContent, Chip, Button, Skeleton, Box, Typography, Grid, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tasks from real API
        const tasksData = await taskService.getTasks({ per_page: 100 });
        const tasks = tasksData.data || [];

        // Calculate stats
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.is_completed).length;
        const pendingTasks = tasks.filter(t => !t.is_completed).length;
        const overdueTasks = tasks.filter(t => {
          if (t.is_completed || !t.due_date) return false;
          return new Date(t.due_date) < new Date();
        }).length;

        setStats({
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        });

        // Get recent tasks (sorted by created_at desc)
        const sortedByCreated = [...tasks].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentTasks(sortedByCreated.slice(0, 5));

        // Get upcoming tasks (sorted by due_date asc, excluding completed)
        const upcoming = tasks
          .filter(t => t.status !== 'completed' && t.due_date)
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        setUpcomingTasks(upcoming.slice(0, 3));

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'success',
    };
    return colors[priority] || 'default';
  };

  const getDueDateInfo = (dueDate, isCompleted) => {
    if (!dueDate) return { text: 'No date', color: 'text.disabled' };
    
    const due = new Date(dueDate);
    const today = new Date();
    const isOverdue = due < today && !isCompleted;
    
    if (isOverdue) {
      return { text: due.toLocaleDateString(), color: 'error.main' };
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (due.toDateString() === tomorrow.toDateString()) {
      return { text: 'Tomorrow', color: 'warning.main' };
    }
    
    if (due.toDateString() === today.toDateString()) {
      return { text: 'Today', color: 'primary.main' };
    }
    
    return { text: due.toLocaleDateString(), color: 'text.secondary' };
  };

  // Stat Card Component
  const StatCard = ({ icon: Icon, label, value, color, bgcolor }) => (
    <Card sx={{ cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: bgcolor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ fontSize: 24, color: 'white' }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // Loading skeleton for stats
  const StatsSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(4)].map((_, i) => (
        <Grid item xs={12} sm={6} lg={3} key={i}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={80} />
                <Skeleton variant="text" width={48} height={32} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'fadeIn 0.3s ease-in-out' }}>
          <Skeleton variant="text" width={200} height={40} />
          <StatsSkeleton />
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Skeleton variant="rectangular" height={256} sx={{ borderRadius: 2, mb: 3 }} />
              <Skeleton variant="rectangular" height={192} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'fadeIn 0.3s ease-in-out', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Error Loading Dashboard</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>{error}</Typography>
            <Button variant="contained" onClick={() => window.location.reload()} startIcon={<RefreshIcon />}>
              Try Again
            </Button>
          </Box>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: 'fadeIn 0.3s ease-in-out' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Here's what's happening with your tasks today.
            </Typography>
          </Box>
          <Link to="/tasks/new">
            <Button variant="contained" startIcon={<AddIcon />}>
              New Task
            </Button>
          </Link>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={AssignmentIcon}
              label="Total Tasks"
              value={stats.totalTasks}
              bgcolor="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={CheckCircleIcon}
              label="Completed"
              value={stats.completedTasks}
              bgcolor="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={AccessTimeIcon}
              label="Pending"
              value={stats.pendingTasks}
              bgcolor="warning.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={WarningIcon}
              label="Overdue"
              value={stats.overdueTasks}
              bgcolor="error.main"
            />
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Recent Tasks */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ animation: 'slideUp 0.3s ease-out', animationDelay: '100ms' }}>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  Recent Tasks
                </Typography>
                <Link to="/tasks" style={{ fontSize: '0.875rem', color: '#1976d2', textDecoration: 'none' }}>
                  View all
                </Link>
              </Box>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                {recentTasks.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: '50%', 
                      bgcolor: 'grey.100', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}>
                      <AssignmentIcon sx={{ fontSize: 32, color: 'grey.400' }} />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>No tasks yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Get started by creating your first task.
                    </Typography>
                    <Link to="/tasks/new">
                      <Button variant="contained" size="small" startIcon={<AddIcon />}>
                        Create your first task
                      </Button>
                    </Link>
                  </Box>
                ) : (
                  <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                    {recentTasks.map((task, index) => {
                      const dueDateInfo = getDueDateInfo(task.due_date, task.is_completed);
                      return (
                        <Link
                          key={task.id}
                          to={`/tasks/${task.id}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'background-color 0.15s',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                            animation: 'fadeIn 0.3s ease-in-out',
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: task.is_completed ? 'success.light' : 'grey.100',
                              }}
                            >
                              {task.is_completed ? (
                                <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
                              ) : (
                                <AssignmentIcon sx={{ fontSize: 20, color: 'grey.500' }} />
                              )}
                            </Box>
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  textDecoration: task.is_completed ? 'line-through' : 'none',
                                  color: task.is_completed ? 'text.secondary' : 'text.primary',
                                }}
                              >
                                {task.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: dueDateInfo.color }}>
                                {dueDateInfo.text}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={task.priority} 
                              size="small" 
                              color={getPriorityColor(task.priority)}
                            />
                            <Chip 
                              label={task.is_completed ? 'Completed' : 'Pending'} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        </Link>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Progress Card */}
              <Card sx={{ p: 3, animation: 'slideUp 0.3s ease-out', animationDelay: '100ms' }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                  Weekly Progress
                </Typography>
                <Box sx={{ textAlign: 'center', mb: 2, position: 'relative', display: 'inline-flex', mx: 'auto' }}>
                  <CircularProgress
                    variant="determinate"
                    value={stats.completionRate}
                    size={128}
                    thickness={4}
                    sx={{ color: 'primary.main', transform: 'rotate(-90deg)' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="h4" component="p" sx={{ fontWeight: 700 }}>
                      {stats.completionRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Complete
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <Typography color="text.secondary">{stats.completedTasks} completed</Typography>
                  <Typography color="text.secondary">{stats.totalTasks} total</Typography>
                </Box>
              </Card>

              {/* Upcoming Tasks */}
              <Card sx={{ animation: 'slideUp 0.3s ease-out', animationDelay: '200ms' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    Upcoming
                  </Typography>
                </Box>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 2 } }}>
                  {upcomingTasks.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No upcoming tasks
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                      {upcomingTasks.map((task) => {
                        const dueDateInfo = getDueDateInfo(task.due_date, task.is_completed);
                        return (
                          <Link
                            key={task.id}
                            to={`/tasks/${task.id}`}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              p: 2,
                              textDecoration: 'none',
                              color: 'inherit',
                              transition: 'transform 0.15s',
                              '&:hover': {
                                bgcolor: 'action.hover',
                                transform: 'scale(1.02)',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                bgcolor: 'primary.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CalendarTodayIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                {task.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: dueDateInfo.color }}>
                                {dueDateInfo.text}
                              </Typography>
                            </Box>
                          </Link>
                        );
                      })}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ p: 3, animation: 'slideUp 0.3s ease-out', animationDelay: '300ms' }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Link
                to="/tasks/new"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: 'text.secondary',
                  transition: 'all 0.2s',
                  animation: 'fadeIn 0.3s ease-in-out',
                  animationDelay: '350ms',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'primary.main',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AddIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  New Task
                </Typography>
              </Link>
            </Grid>
            <Grid item xs={6} md={3}>
              <Link
                to="/tasks"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: 'text.secondary',
                  transition: 'all 0.2s',
                  animation: 'fadeIn 0.3s ease-in-out',
                  animationDelay: '400ms',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'success.main',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: 24, color: 'success.main' }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  View Tasks
                </Typography>
              </Link>
            </Grid>
            <Grid item xs={6} md={3}>
              <Link
                to="/notifications"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: 'text.secondary',
                  transition: 'all 0.2s',
                  animation: 'fadeIn 0.3s ease-in-out',
                  animationDelay: '450ms',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'warning.main',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'warning.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: 24, color: 'warning.main' }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  System
                </Typography>
              </Link>
            </Grid>
            <Grid item xs={6} md={3}>
              <Link
                to="/settings"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: 'text.secondary',
                  transition: 'all 0.2s',
                  animation: 'fadeIn 0.3s ease-in-out',
                  animationDelay: '500ms',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'text.primary',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SettingsIcon sx={{ fontSize: 24, color: 'grey.600' }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Settings
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default Dashboard;
