import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/index';
import { Card, CardBody, Badge, Button, Skeleton, PageHeader } from '../components/ui/index';
import { Icons } from '../components/ui/Icons';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';

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

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'danger',
      medium: 'warning',
      low: 'success',
    };
    return <Badge variant={variants[priority] || 'secondary'}>{priority}</Badge>;
  };

  const getStatusBadge = (isCompleted) => {
    return isCompleted ? (
      <Badge variant="success">Completed</Badge>
    ) : (
      <Badge variant="secondary">Pending</Badge>
    );
  };

  const getDueDateInfo = (dueDate, isCompleted) => {
    if (!dueDate) return { text: 'No date', className: 'text-secondary-400' };
    
    const due = new Date(dueDate);
    const today = new Date();
    const isOverdue = due < today && !isCompleted;
    
    if (isOverdue) {
      return { text: due.toLocaleDateString(), className: 'text-danger-600' };
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (due.toDateString() === tomorrow.toDateString()) {
      return { text: 'Tomorrow', className: 'text-warning-600' };
    }
    
    if (due.toDateString() === today.toDateString()) {
      return { text: 'Today', className: 'text-primary-600' };
    }
    
    return { text: due.toLocaleDateString(), className: 'text-secondary-600' };
  };

  // Stat Card Component
  const StatCard = ({ icon: Icon, label, value, change, changeType, color, bgColor }) => (
    <Card hover className="stat-card animate-fade-in">
      <div className={`${bgColor} stat-icon`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {change && (
          <p className={`text-xs mt-1 ${changeType === 'positive' ? 'text-success-600' : 'text-danger-600'}`}>
            {changeType === 'positive' ? '↑' : '↓'} {change} from last week
          </p>
        )}
      </div>
    </Card>
  );

  // Loading skeleton for stats
  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton variant="card" className="w-12 h-12 rounded-xl" />
            <div className="flex-1">
              <Skeleton variant="text" className="w-20 h-4 mb-2" />
              <Skeleton variant="text" className="w-12 h-8" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6 animate-fade-in">
          <Skeleton variant="title" className="w-64" />
          <StatsSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton variant="card" className="lg:col-span-2 h-80" />
            <div className="space-y-6">
              <Skeleton variant="card" className="h-64" />
              <Skeleton variant="card" className="h-48" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="error-state">
            <div className="error-state-icon">
              <Icons.ExclamationCircle className="w-16 h-16" />
            </div>
            <h2 className="error-state-title">Error Loading Dashboard</h2>
            <p className="error-state-description">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <Icons.ArrowRight className="w-4 h-4 mr-2 rotate-[225deg]" />
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-secondary-500 mt-1">
              Here's what's happening with your tasks today.
            </p>
          </div>
          <Link to="/tasks/new">
            <Button icon={<Icons.Plus className="w-4 h-4" />}>
              New Task
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Icons.ClipboardList}
            label="Total Tasks"
            value={stats.totalTasks}
            bgColor="bg-primary-500"
          />
          <StatCard
            icon={Icons.CheckCircle}
            label="Completed"
            value={stats.completedTasks}
            bgColor="bg-success-500"
          />
          <StatCard
            icon={Icons.Clock}
            label="Pending"
            value={stats.pendingTasks}
            bgColor="bg-warning-500"
          />
          <StatCard
            icon={Icons.ExclamationCircle}
            label="Overdue"
            value={stats.overdueTasks}
            bgColor="bg-danger-500"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <Card className="lg:col-span-2 animate-slide-up">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">Recent Tasks</h2>
              <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
                View all
              </Link>
            </div>
            <CardBody className="p-0">
              {recentTasks.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="empty-state-icon mx-auto">
                    <Icons.ClipboardList className="w-12 h-12" />
                  </div>
                  <h3 className="empty-state-title">No tasks yet</h3>
                  <p className="empty-state-description">Get started by creating your first task.</p>
                  <Link to="/tasks/new" className="mt-4 inline-block">
                    <Button icon={<Icons.Plus className="w-4 h-4 mr-1" />} size="sm">
                      Create your first task
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-secondary-100">
                  {recentTasks.map((task, index) => {
                    const dueDateInfo = getDueDateInfo(task.due_date, task.is_completed);
                    return (
                      <Link
                        key={task.id}
                        to={`/tasks/${task.id}`}
                        className="flex items-center justify-between p-4 hover:bg-secondary-50/50 transition-all duration-150 task-row animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-150 ${
                            task.is_completed ? 'bg-success-100' : 'bg-secondary-100'
                          }`}>
                            {task.is_completed ? (
                              <Icons.CheckCircle className="w-5 h-5 text-success-600" />
                            ) : (
                              <Icons.ClipboardList className="w-5 h-5 text-secondary-500" />
                            )}
                          </div>
                          <div>
                            <p className={`font-medium ${task.is_completed ? 'text-secondary-500 line-through' : 'text-secondary-900'}`}>
                              {task.title}
                            </p>
                            <p className={`text-sm ${dueDateInfo.className}`}>
                              {dueDateInfo.text}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.is_completed)}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Weekly Progress</h3>
              <div className="text-center mb-4">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-secondary-100"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${stats.completionRate * 3.52} 352`}
                      className="text-primary-500 progress-ring-indicator"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute">
                    <p className="text-3xl font-bold text-secondary-900">{stats.completionRate}%</p>
                    <p className="text-xs text-secondary-500">Complete</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">{stats.completedTasks} completed</span>
                <span className="text-secondary-500">{stats.totalTasks} total</span>
              </div>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">Upcoming</h3>
              </div>
              <CardBody className="p-0">
                {upcomingTasks.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-secondary-500">No upcoming tasks</p>
                  </div>
                ) : (
                  <div className="divide-y divide-secondary-100">
                    {upcomingTasks.map((task) => {
                      const dueDateInfo = getDueDateInfo(task.due_date, task.is_completed);
                      return (
                        <Link
                          key={task.id}
                          to={`/tasks/${task.id}`}
                          className="flex items-center gap-3 p-4 hover:bg-secondary-50/50 transition-all duration-150 task-row"
                        >
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center transition-transform duration-150 hover:scale-105">
                            <Icons.Calendar className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-secondary-900 truncate">{task.title}</p>
                            <p className={`text-sm ${dueDateInfo.className}`}>
                              {dueDateInfo.text}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              to="/tasks/new" 
              className="quick-action animate-fade-in"
              style={{ animationDelay: '350ms' }}
            >
              <div className="quick-action-icon bg-primary-100">
                <Icons.Plus className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-secondary-700">New Task</span>
            </Link>
            <Link 
              to="/tasks" 
              className="quick-action animate-fade-in"
              style={{ animationDelay: '400ms' }}
            >
              <div className="quick-action-icon bg-success-100">
                <Icons.ClipboardList className="w-6 h-6 text-success-600" />
              </div>
              <span className="text-sm font-medium text-secondary-700">View Tasks</span>
            </Link>
            <Link 
              to="/notifications" 
              className="quick-action animate-fade-in"
              style={{ animationDelay: '450ms' }}
            >
              <div className="quick-action-icon bg-warning-100">
                <Icons.Bell className="w-6 h-6 text-warning-600" />
              </div>
              <span className="text-sm font-medium text-secondary-700">Notifications</span>
            </Link>
            <Link 
              to="/settings" 
              className="quick-action animate-fade-in"
              style={{ animationDelay: '500ms' }}
            >
              <div className="quick-action-icon bg-secondary-200">
                <Icons.Cog className="w-6 h-6 text-secondary-600" />
              </div>
              <span className="text-sm font-medium text-secondary-700">Settings</span>
            </Link>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
