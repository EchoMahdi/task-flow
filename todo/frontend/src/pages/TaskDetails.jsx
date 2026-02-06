import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/index';
import { Card, CardContent, Chip, Button, Modal, Skeleton, Divider } from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import { Icons } from '../components/ui/Icons';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setTask({
        id: parseInt(id),
        title: 'API integration for notifications',
        description: 'Integrate notification service with the backend API. This includes setting up webhooks, handling real-time updates, and implementing push notifications for both web and mobile platforms.',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-02-05',
        dueTime: '17:00',
        tags: ['backend', 'api', 'notifications'],
        notes: 'Need to coordinate with the backend team for API endpoints. The notification service should support email, SMS, and push notifications.',
        createdAt: '2026-01-30T10:30:00Z',
        updatedAt: '2026-02-03T14:45:00Z',
        completedAt: null,
        subtasks: [
          { id: 1, title: 'Set up webhook endpoints', completed: true },
          { id: 2, title: 'Implement real-time updates', completed: true },
          { id: 3, title: 'Add push notification support', completed: false },
          { id: 4, title: 'Write integration tests', completed: false },
        ],
        activity: [
          { id: 1, type: 'created', user: 'John Doe', timestamp: '2026-01-30T10:30:00Z' },
          { id: 2, type: 'status_changed', user: 'John Doe', from: 'pending', to: 'in_progress', timestamp: '2026-02-01T09:15:00Z' },
          { id: 3, type: 'subtask_completed', user: 'John Doe', subtask: 'Set up webhook endpoints', timestamp: '2026-02-02T11:20:00Z' },
          { id: 4, type: 'subtask_completed', user: 'John Doe', subtask: 'Implement real-time updates', timestamp: '2026-02-03T14:45:00Z' },
        ],
      });
      
      setLoading(false);
    };
    
    fetchTask();
  }, [id]);

  const handleDelete = async () => {
    // API call would go here
    navigate('/tasks');
  };

  const handleToggleComplete = async () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    setTask({ ...task, status: newStatus });
  };

  const handleToggleSubtask = (subtaskId) => {
    setTask({
      ...task,
      subtasks: task.subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      ),
    });
  };

  const getPriorityBadge = (priority) => {
    const variants = { high: 'danger', medium: 'warning', low: 'secondary' };
    return <Chip variant={variants[priority]}>{priority}</Chip>;
  };

  const getStatusBadge = (status) => {
    const config = {
      completed: { variant: 'success', label: 'Completed' },
      in_progress: { variant: 'primary', label: 'In Progress' },
      pending: { variant: 'secondary', label: 'Pending' },
    };
    const { variant, label } = config[status] || config.pending;
    return <Chip variant={variant}>{label}</Chip>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'created':
        return <Icons.Plus className="w-4 h-4" />;
      case 'status_changed':
        return <Icons.ArrowRight className="w-4 h-4" />;
      case 'subtask_completed':
        return <Icons.CheckCircle className="w-4 h-4" />;
      default:
        return <Icons.Clock className="w-4 h-4" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'created':
        return `${activity.user} created this task`;
      case 'status_changed':
        return `${activity.user} changed status from ${activity.from} to ${activity.to}`;
      case 'subtask_completed':
        return `${activity.user} completed subtask "${activity.subtask}"`;
      default:
        return 'Unknown activity';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton variant="title" className="w-64" />
          <Skeleton variant="card" className="h-96" />
        </div>
      </MainLayout>
    );
  }

  if (!task) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <Icons.ExclamationCircle className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Task not found</h2>
          <p className="text-secondary-500 mb-6">The task you're looking for doesn't exist or has been deleted.</p>
          <Link to="/tasks">
            <Button>Back to Tasks</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const subtaskProgress = (completedSubtasks / task.subtasks.length) * 100;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          breadcrumbs={[
            { label: 'Tasks', href: '/tasks' },
            { label: task.title },
          ]}
          actions={
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleToggleComplete}>
                {task.status === 'completed' ? (
                  <>
                    <Icons.X className="w-4 h-4 mr-2" />
                    Mark Incomplete
                  </>
                ) : (
                  <>
                    <Icons.Check className="w-4 h-4 mr-2" />
                    Mark Complete
                  </>
                )}
              </Button>
              <Link to={`/tasks/${id}/edit`}>
                <Button variant="outline">
                  <Icons.Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="danger" onClick={() => setDeleteModal(true)}>
                <Icons.Trash className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Info */}
            <Card>
              <CardContent>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    task.status === 'completed' ? 'bg-success-100' : 'bg-primary-100'
                  }`}>
                    {task.status === 'completed' ? (
                      <Icons.CheckCircle className="w-6 h-6 text-success-600" />
                    ) : (
                      <Icons.ClipboardList className="w-6 h-6 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className={`text-2xl font-bold ${
                      task.status === 'completed' ? 'text-secondary-500 line-through' : 'text-secondary-900'
                    }`}>
                      {task.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                </div>

                <Divider />

                <div className="prose prose-secondary max-w-none">
                  <h3 className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-2">
                    Description
                  </h3>
                  <p className="text-secondary-700">{task.description}</p>
                </div>

                {task.notes && (
                  <>
                    <Divider />
                    <div>
                      <h3 className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-2">
                        Notes
                      </h3>
                      <p className="text-secondary-700">{task.notes}</p>
                    </div>
                  </>
                )}

                {task.tags.length > 0 && (
                  <>
                    <Divider />
                    <div>
                      <h3 className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-2">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag) => (
                          <Chip key={tag} variant="primary">#{tag}</Chip>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Subtasks */}
            <Card>
              <div className="card-header flex items-center justify-between">
                <h2 className="text-lg font-semibold text-secondary-900">
                  Subtasks ({completedSubtasks}/{task.subtasks.length})
                </h2>
                <Button variant="ghost" size="sm">
                  <Icons.Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <CardContent className="p-0">
                {/* Progress bar */}
                <div className="px-6 py-3 bg-secondary-50 border-b border-secondary-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-secondary-500">Progress</span>
                    <span className="font-medium text-secondary-700">{Math.round(subtaskProgress)}%</span>
                  </div>
                  <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-300"
                      style={{ width: `${subtaskProgress}%` }}
                    />
                  </div>
                </div>

                <div className="divide-y divide-secondary-100">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-secondary-50 transition-colors"
                    >
                      <button
                        onClick={() => handleToggleSubtask(subtask.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          subtask.completed
                            ? 'bg-success-500 border-success-500'
                            : 'border-secondary-300 hover:border-primary-500'
                        }`}
                      >
                        {subtask.completed && (
                          <Icons.Check className="w-3 h-3 text-white" />
                        )}
                      </button>
                      <span className={`flex-1 ${subtask.completed ? 'text-secondary-500 line-through' : 'text-secondary-900'}`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity */}
            <Card>
              <div className="card-header">
                <h2 className="text-lg font-semibold text-secondary-900">Activity</h2>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-secondary-100">
                  {task.activity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 px-6 py-4">
                      <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-500">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-secondary-700">{getActivityText(activity)}</p>
                        <p className="text-xs text-secondary-500 mt-1">{formatDateTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <Card className="p-6">
              <h3 className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-4">
                Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Icons.Calendar className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="text-xs text-secondary-500">Due Date</p>
                    <p className="text-sm font-medium text-secondary-900">
                      {formatDate(task.dueDate)}
                      {task.dueTime && ` at ${task.dueTime}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icons.Flag className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="text-xs text-secondary-500">Priority</p>
                    <p className="text-sm font-medium text-secondary-900 capitalize">{task.priority}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icons.Clock className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="text-xs text-secondary-500">Created</p>
                    <p className="text-sm font-medium text-secondary-900">{formatDate(task.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icons.Pencil className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="text-xs text-secondary-500">Last Updated</p>
                    <p className="text-sm font-medium text-secondary-900">{formatDate(task.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="ghost" fullWidth className="justify-start">
                  <Icons.Bell className="w-4 h-4 mr-2" />
                  Set Reminder
                </Button>
                <Button variant="ghost" fullWidth className="justify-start">
                  <Icons.Document className="w-4 h-4 mr-2" />
                  Duplicate Task
                </Button>
                <Button variant="ghost" fullWidth className="justify-start">
                  <Icons.ArrowRight className="w-4 h-4 mr-2" />
                  Move to Project
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Delete Modal */}
        <Modal
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          title="Delete Task"
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </>
          }
        >
          <p className="text-secondary-600">
            Are you sure you want to delete "{task.title}"? This action cannot be undone.
          </p>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default TaskDetails;
