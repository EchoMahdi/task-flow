import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../components/layout/index';
import { 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  Alert, 
  Chip, 
  Box, 
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton
} from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { taskService } from '../services/taskService';
import { tagService } from '../services/tagService';

const TaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    selectedTags: [],
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');

  // Load task data from backend if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch available tags
        const tagsData = await tagService.getTags();
        setTags(tagsData.data || []);
        
        if (isEditing) {
          // Fetch task from backend
          const task = await taskService.getTask(id);
          
          setFormData({
            title: task.title || '',
            description: task.description || '',
            status: task.is_completed ? 'completed' : 'in_progress',
            priority: task.priority || 'medium',
            dueDate: task.due_date ? task.due_date.split('T')[0] : '',
            dueTime: '',
            selectedTags: task.tags?.map(t => t.id) || [],
            notes: '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch task:', err);
        setError('Failed to load task data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.selectedTags.includes(newTag)) {
        setFormData((prev) => ({ ...prev, selectedTags: [...prev.selectedTags, newTag] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // REAL API call to create/update task
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSaving(true);
    setError('');
    
    try {
      // Prepare data for backend
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        is_completed: formData.status === 'completed',
        due_date: formData.dueDate ? formData.dueDate : null,
        tags: formData.selectedTags,
      };
      
      if (isEditing) {
        // Update existing task
        await taskService.updateTask(id, taskData);
      } else {
        // Create new task
        await taskService.createTask(taskData);
      }
      
      navigate('/tasks');
    } catch (err) {
      console.error('Failed to save task:', err);
      setError(err.response?.data?.message || 'Failed to save task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Skeleton variant="text" width="30%" height={32} />
            <Skeleton variant="rounded" height={300} />
          </Box>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <PageHeader
          title={isEditing ? 'Edit Task' : 'Create New Task'}
          description={isEditing ? 'Update the task details below' : 'Fill in the details to create a new task'}
          breadcrumbs={[
            { label: 'Tasks', href: '/tasks' },
            { label: isEditing ? 'Edit' : 'New' },
          ]}
        />

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            icon={<WarningAmberIcon sx={{ fontSize: 20 }} />}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Title */}
              <TextField
                label="Task Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
                error={Boolean(errors.title)}
                helperText={errors.title}
                autoFocus
                fullWidth
              />

              {/* Description */}
              <TextField
                multiline
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the task in detail..."
                rows={4}
                helperText="Provide a clear description of what needs to be done"
                fullWidth
              />

              {/* Status & Priority */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    label="Priority"
                  >
                    {priorityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Due Date & Time */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Due Date"
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  error={Boolean(errors.dueDate)}
                  helperText={errors.dueDate}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Due Time (Optional)"
                  type="time"
                  name="dueTime"
                  value={formData.dueTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>

              {/* Tags */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {formData.selectedTags.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId);
                    return (
                      <Chip 
                        key={tagId} 
                        color="primary" 
                        label={`#${tag?.name || tagId}`}
                        onDelete={() => handleRemoveTag(tagId)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      />
                    );
                  })}
                </Box>
                <TextField
                  placeholder="Type a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  helperText="Press Enter to add a tag"
                  size="small"
                  fullWidth
                />
              </Box>

              {/* Notes */}
              <TextField
                label="Additional Notes (Optional)"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes or context..."
                rows={3}
                multiline
                fullWidth
              />
            </CardContent>

            {/* Footer */}
            <Box sx={{ px: 3, py: 2, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button
                type="button"
                variant="text"
                onClick={() => navigate('/tasks')}
              >
                Cancel
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isEditing && (
                  <Button type="button" variant="outlined" startIcon={<VisibilityIcon />}>
                    Preview
                  </Button>
                )}
                <Button type="submit" variant="contained" disabled={saving}>
                  {isEditing ? 'Save Changes' : 'Create Task'}
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default TaskForm;
