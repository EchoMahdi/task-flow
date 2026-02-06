import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../components/layout/index';
import { Card, CardContent, Button, Input,  TextField, Select, Alert, Chip } from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import { Icons } from '../components/ui/Icons';
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
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-secondary-200 rounded w-48" />
            <div className="h-64 bg-secondary-200 rounded" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
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
            variant="danger"
            className="mb-6"
            icon={<Icons.ExclamationCircle className="w-5 h-5" />}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="space-y-6">
              {/* Title */}
              <Input
                label="Task Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
                error={errors.title}
                autoFocus
              />

              {/* Description */}
              < TextField
              multiline
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the task in detail..."
                rows={4}
                helper="Provide a clear description of what needs to be done"
              />

              {/* Status & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={statusOptions}
                />
                <Select
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  options={priorityOptions}
                />
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Due Date"
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  error={errors.dueDate}
                />
                <Input
                  label="Due Time (Optional)"
                  type="time"
                  name="dueTime"
                  value={formData.dueTime}
                  onChange={handleChange}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="label">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.selectedTags.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId);
                    return (
                      <Chip key={tagId} variant="primary" className="flex items-center gap-1">
                        #{tag?.name || tagId}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tagId)}
                          className="ml-1 hover:text-primary-900"
                        >
                          <Icons.X className="w-3 h-3" />
                        </button>
                      </Chip>
                    );
                  })}
                </div>
                <Input
                  placeholder="Type a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  helper="Press Enter to add a tag"
                />
              </div>

              {/* Notes */}
              < TextField
                label="Additional Notes (Optional)"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes or context..."
                rows={3}
              />
            </CardContent>

            {/* Footer */}
            <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-100 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/tasks')}
              >
                Cancel
              </Button>
              <div className="flex items-center gap-3">
                {isEditing && (
                  <Button type="button" variant="outline">
                    <Icons.Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                )}
                <Button type="submit" loading={saving} disabled={saving}>
                  {isEditing ? 'Save Changes' : 'Create Task'}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
};

export default TaskForm;
