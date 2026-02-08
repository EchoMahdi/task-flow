import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import LoadingButton from '@/components/ui/LoadingButton';

function TaskForm({ task, tags, onSubmit, onCancel, loading }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
      setSelectedTags(task.tags?.map(t => t.id) || []);
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      title,
      description,
      priority,
      due_date: dueDate || null,
      tags: selectedTags,
    };
    
    onSubmit(data);
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'var(--theme-font-weight-semibold, 600)' }}>
          {task ? 'Edit Task' : 'Create New Task'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            size="small"
          />
          
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
            size="small"
          />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Box>
          
          {tags.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: 'text.secondary' }}>
                Tags
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    onClick={() => toggleTag(tag.id)}
                    color={selectedTags.includes(tag.id) ? 'primary' : 'default'}
                    variant={selectedTags.includes(tag.id) ? 'filled' : 'outlined'}
                    sx={{
                      borderColor: tag.color,
                      ...(selectedTags.includes(tag.id) && {
                        bgcolor: tag.color,
                        '&:hover': {
                          bgcolor: tag.color,
                          filter: 'brightness(0.9)'
                        }
                      })
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={loading}
              loadingText="Saving..."
            >
              {task ? 'Update Task' : 'Create Task'}
            </LoadingButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TaskForm;
