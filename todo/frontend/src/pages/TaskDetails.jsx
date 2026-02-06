import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/index';
import { 
  Card, 
  CardContent, 
  Chip, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton, 
  Divider,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  IconButton
} from '@mui/material';
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
    const colors = { high: 'error', medium: 'warning', low: 'default' };
    return <Chip color={colors[priority]} label={priority} />;
  };

  const getStatusBadge = (status) => {
    const config = {
      completed: { color: 'success', label: 'Completed' },
      in_progress: { color: 'primary', label: 'In Progress' },
      pending: { color: 'default', label: 'Pending' },
    };
    const { color, label } = config[status] || config.pending;
    return <Chip color={color} label={label} />;
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
        <Box sx={{ maxWidth: 1000, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton variant="text" width="30%" height={40} />
          <Skeleton variant="rounded" height={400} />
        </Box>
      </MainLayout>
    );
  }

  if (!task) {
    return (
      <MainLayout>
        <Box sx={{ maxWidth: 1000, mx: 'auto', textAlign: 'center', py: 6 }}>
          <Icons.ExclamationCircle sx={{ fontSize: 64, color: 'action.disabled', mx: 'auto', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>Task not found</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>The task you're looking for doesn't exist or has been deleted.</Typography>
          <Link to="/tasks">
            <Button variant="contained">Back to Tasks</Button>
          </Link>
        </Box>
      </MainLayout>
    );
  }

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const subtaskProgress = (completedSubtasks / task.subtasks.length) * 100;

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <PageHeader
          breadcrumbs={[
            { label: 'Tasks', href: '/tasks' },
            { label: task.title },
          ]}
          actions={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button variant="outlined" onClick={handleToggleComplete}>
                {task.status === 'completed' ? (
                  <>
                    <Icons.X sx={{ mr: 1, fontSize: 16 }} />
                    Mark Incomplete
                  </>
                ) : (
                  <>
                    <Icons.Check sx={{ mr: 1, fontSize: 16 }} />
                    Mark Complete
                  </>
                )}
              </Button>
              <Link to={`/tasks/${id}/edit`}>
                <Button variant="outlined">
                  <Icons.Pencil sx={{ mr: 1, fontSize: 16 }} />
                  Edit
                </Button>
              </Link>
              <Button variant="contained" color="error" onClick={() => setDeleteModal(true)}>
                <Icons.Trash sx={{ mr: 1, fontSize: 16 }} />
                Delete
              </Button>
            </Box>
          }
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
          {/* Main Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Task Info */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: task.status === 'completed' ? 'success.light' : 'primary.light'
                  }}>
                    {task.status === 'completed' ? (
                      <Icons.CheckCircle sx={{ fontSize: 24, color: 'success.main' }} />
                    ) : (
                      <Icons.ClipboardList sx={{ fontSize: 24, color: 'primary.main' }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: task.status === 'completed' ? 'text.secondary' : 'text.primary', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                      {task.title}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mt: 1 }}>
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>{task.description}</Typography>
                </Box>

                {task.notes && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                        Notes
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.primary' }}>{task.notes}</Typography>
                    </Box>
                  </>
                )}

                {task.tags.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {task.tags.map((tag) => (
                          <Chip key={tag} color="primary" label={`#${tag}`} />
                        ))}
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Subtasks */}
            <Card>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Subtasks ({completedSubtasks}/{task.subtasks.length})
                </Typography>
                <Button variant="text" size="small" startIcon={<Icons.Plus />}>
                  Add
                </Button>
              </Box>
              <CardContent sx={{ p: 0 }}>
                {/* Progress bar */}
                <Box sx={{ px: 3, py: 2, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Progress</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>{Math.round(subtaskProgress)}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={subtaskProgress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': { borderRadius: 4 }
                    }} 
                  />
                </Box>

                <List>
                  {task.subtasks.map((subtask) => (
                    <ListItem 
                      key={subtask.id} 
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <IconButton
                          onClick={() => handleToggleSubtask(subtask.id)}
                          size="small"
                          sx={{
                            width: 20,
                            height: 20,
                            border: 2,
                            borderColor: subtask.completed ? 'success.main' : 'action.disabled',
                            bgcolor: subtask.completed ? 'success.main' : 'transparent',
                            '&:hover': { borderColor: 'primary.main' }
                          }}
                        >
                          {subtask.completed && <Icons.Check sx={{ fontSize: 12, color: 'white' }} />}
                        </IconButton>
                      </ListItemIcon>
                      <ListItemText 
                        primary={subtask.title}
                        sx={{ 
                          flex: 1,
                          '& .MuiTypography-root': { 
                            color: subtask.completed ? 'text.secondary' : 'text.primary',
                            textDecoration: subtask.completed ? 'line-through' : 'none'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Activity */}
            <Card>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>Activity</Typography>
              </Box>
              <CardContent sx={{ p: 0 }}>
                <List>
                  {task.activity.map((activity) => (
                    <ListItem key={activity.id} sx={{ px: 3, py: 2 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                          {getActivityIcon(activity.type)}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ color: 'text.primary' }}>{getActivityText(activity)}</Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDateTime(activity.timestamp)}</Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Details */}
            <Card sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Icons.Calendar sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Due Date</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {formatDate(task.dueDate)}
                      {task.dueTime && ` at ${task.dueTime}`}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Icons.Flag sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Priority</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', textTransform: 'capitalize' }}>{task.priority}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Icons.Clock sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Created</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>{formatDate(task.createdAt)}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Icons.Pencil sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Last Updated</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>{formatDate(task.updatedAt)}</Typography>
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="text" fullWidth sx={{ justifyContent: 'flex-start' }}>
                  <Icons.Bell sx={{ mr: 1, fontSize: 16 }} />
                  Set Reminder
                </Button>
                <Button variant="text" fullWidth sx={{ justifyContent: 'flex-start' }}>
                  <Icons.Document sx={{ mr: 1, fontSize: 16 }} />
                  Duplicate Task
                </Button>
                <Button variant="text" fullWidth sx={{ justifyContent: 'flex-start' }}>
                  <Icons.ArrowRight sx={{ mr: 1, fontSize: 16 }} />
                  Move to Project
                </Button>
              </Box>
            </Card>
          </Box>
        </Box>

        {/* Delete Modal */}
        <Dialog
          open={deleteModal}
          onClose={() => setDeleteModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Task</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default TaskDetails;
