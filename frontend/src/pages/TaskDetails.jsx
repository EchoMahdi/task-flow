import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/index';
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
  IconButton,
  TextField
} from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import DateDisplay from '../components/ui/DateDisplay';
import { subtaskService } from '../services/subtaskService';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DescriptionIcon from '@mui/icons-material/Description';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addSubtaskModal, setAddSubtaskModal] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [subtasksLoading, setSubtasksLoading] = useState(false);
  const [reminderModal, setReminderModal] = useState(false);
  const [duplicateModal, setDuplicateModal] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      // Simulating API call delay - replace with actual API call
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
        activity: [
          { id: 1, type: 'created', user: 'John Doe', timestamp: '2026-01-30T10:30:00Z' },
          { id: 2, type: 'status_changed', user: 'John Doe', from: 'pending', to: 'in_progress', timestamp: '2026-02-01T09:15:00Z' },
        ],
      });

      // Fetch real subtasks from API
      try {
        setSubtasksLoading(true);
        const fetchedSubtasks = await subtaskService.getSubtasks(parseInt(id));
        setSubtasks(fetchedSubtasks);
      } catch (error) {
        console.error('Error fetching subtasks:', error);
        // Fallback to empty array if API fails
        setSubtasks([]);
      } finally {
        setSubtasksLoading(false);
        setLoading(false);
      }
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

  const handleToggleSubtask = async (subtaskId) => {
    try {
      const updatedSubtask = await subtaskService.toggleSubtaskComplete(parseInt(id), subtaskId);
      setSubtasks(subtasks.map(st =>
        st.id === subtaskId ? { ...st, is_completed: updatedSubtask.is_completed } : st
      ));
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    
    try {
      const newSubtask = await subtaskService.createSubtask(parseInt(id), {
        title: newSubtaskTitle.trim()
      });
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtaskTitle('');
      setAddSubtaskModal(false);
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await subtaskService.deleteSubtask(parseInt(id), subtaskId);
      setSubtasks(subtasks.filter(st => st.id !== subtaskId));
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handleSetReminder = async () => {
    if (!reminderDate || !reminderTime) return;
    
    try {
      // API call to set reminder
      console.log('Setting reminder for', { date: reminderDate, time: reminderTime });
      setReminderModal(false);
      setReminderDate('');
      setReminderTime('');
      alert('Reminder set successfully!');
    } catch (error) {
      console.error('Error setting reminder:', error);
    }
  };

  const handleDuplicateTask = async () => {
    try {
      // API call to duplicate task
      console.log('Duplicating task', id);
      const newTaskId = Math.floor(Math.random() * 1000) + 100; // Simulated new task ID
      setDuplicateModal(false);
      navigate(`/tasks/${newTaskId}`);
    } catch (error) {
      console.error('Error duplicating task:', error);
    }
  };

  const handleMoveTask = async () => {
    try {
      // API call to move task
      console.log('Moving task', id);
      setMoveModal(false);
      alert('Task moved successfully!');
    } catch (error) {
      console.error('Error moving task:', error);
    }
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'created':
        return <AddIcon sx={{ fontSize: 16 }} />;
      case 'status_changed':
        return <ArrowForwardIcon sx={{ fontSize: 16 }} />;
      case 'subtask_completed':
        return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      default:
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
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
      <AppLayout>
        <Box sx={{ maxWidth: 1000, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton variant="text" width="30%" height={40} />
          <Skeleton variant="rounded" height={400} />
        </Box>
      </AppLayout>
    );
  }

  if (!task) {
    return (
      <AppLayout>
        <Box sx={{ maxWidth: 1000, mx: 'auto', textAlign: 'center', py: 6 }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'action.disabled', mx: 'auto', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>Task not found</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>The task you're looking for doesn't exist or has been deleted.</Typography>
          <Link to="/tasks">
            <Button variant="contained">Back to Tasks</Button>
          </Link>
        </Box>
      </AppLayout>
    );
  }

  const completedSubtasks = subtasks.filter(st => st.is_completed).length;
  const subtaskProgress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  return (
    <AppLayout>
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
                    <CloseIcon sx={{ mr: 1, fontSize: 16 }} />
                    Mark Incomplete
                  </>
                ) : (
                  <>
                    <CheckIcon sx={{ mr: 1, fontSize: 16 }} />
                    Mark Complete
                  </>
                )}
              </Button>
              <Link to={`/tasks/${id}/edit`}>
                <Button variant="outlined">
                  <EditIcon sx={{ mr: 1, fontSize: 16 }} />
                  Edit
                </Button>
              </Link>
              <Button variant="contained" color="error" onClick={() => setDeleteModal(true)}>
                <DeleteIcon sx={{ mr: 1, fontSize: 16 }} />
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
                      <CheckCircleIcon sx={{ fontSize: 24, color: 'success.main' }} />
                    ) : (
                      <FormatListBulletedIcon sx={{ fontSize: 24, color: 'primary.main' }} />
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
                  Subtasks ({completedSubtasks}/{subtasks.length})
                </Typography>
                <Button variant="text" size="small" startIcon={<AddIcon />} onClick={() => setAddSubtaskModal(true)}>
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

                {subtasksLoading ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading subtasks...</Typography>
                  </Box>
                ) : subtasks.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No subtasks yet</Typography>
                  </Box>
                ) : (
                  <List>
                    {subtasks.map((subtask) => (
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
                              borderColor: subtask.is_completed ? 'success.main' : 'action.disabled',
                              bgcolor: subtask.is_completed ? 'success.main' : 'transparent',
                              '&:hover': { borderColor: 'primary.main' }
                            }}
                          >
                            {subtask.is_completed && <CheckIcon sx={{ fontSize: 12, color: 'white' }} />}
                          </IconButton>
                        </ListItemIcon>
                        <ListItemText 
                          primary={subtask.title}
                          sx={{ 
                            flex: 1,
                            '& .MuiTypography-root': { 
                              color: subtask.is_completed ? 'text.secondary' : 'text.primary',
                              textDecoration: subtask.is_completed ? 'line-through' : 'none'
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
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
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            <DateDisplay date={activity.timestamp} showTime={true} variant="compact" />
                          </Typography>
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
                  <CalendarTodayIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Due Date</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      <DateDisplay date={task.dueDate} variant="compact" />
                      {task.dueTime && ` at ${task.dueTime}`}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FlagIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Priority</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', textTransform: 'capitalize' }}>{task.priority}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ScheduleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Created</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      <DateDisplay date={task.createdAt} variant="compact" />
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <EditIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Last Updated</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      <DateDisplay date={task.updatedAt} variant="compact" />
                    </Typography>
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
                <Button variant="text" fullWidth sx={{ justifyContent: 'flex-start' }} onClick={() => setReminderModal(true)}>
                  <NotificationsIcon sx={{ mr: 1, fontSize: 16 }} />
                  Set Reminder
                </Button>
                <Button variant="text" fullWidth sx={{ justifyContent: 'flex-start' }} onClick={() => setDuplicateModal(true)}>
                  <DescriptionIcon sx={{ mr: 1, fontSize: 16 }} />
                  Duplicate Task
                </Button>
                <Button variant="text" fullWidth sx={{ justifyContent: 'flex-start' }} onClick={() => setMoveModal(true)}>
                  <ArrowForwardIcon sx={{ mr: 1, fontSize: 16 }} />
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

        {/* Add Subtask Modal */}
        <Dialog
          open={addSubtaskModal}
          onClose={() => setAddSubtaskModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Subtask</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Subtask title"
              fullWidth
              variant="outlined"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
            />
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={() => setAddSubtaskModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()}>
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reminder Modal */}
        <Dialog
          open={reminderModal}
          onClose={() => setReminderModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Set Reminder</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Time"
                type="time"
                fullWidth
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={() => setReminderModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSetReminder} disabled={!reminderDate || !reminderTime}>
              Set Reminder
            </Button>
          </DialogActions>
        </Dialog>

        {/* Duplicate Task Modal */}
        <Dialog
          open={duplicateModal}
          onClose={() => setDuplicateModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Duplicate Task</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ color: 'text.primary' }}>
              Are you sure you want to duplicate "{task.title}"? A new task will be created with the same details.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={() => setDuplicateModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleDuplicateTask}>
              Duplicate
            </Button>
          </DialogActions>
        </Dialog>

        {/* Move Task Modal */}
        <Dialog
          open={moveModal}
          onClose={() => setMoveModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Move to Project</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ color: 'text.primary', mb: 2 }}>
              Select a project to move "{task.title}" to:
            </Typography>
            <TextField
              label="Project"
              fullWidth
              placeholder="Enter project name or select from list"
            />
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={() => setMoveModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleMoveTask}>
              Move
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  );
};

export default TaskDetails;
