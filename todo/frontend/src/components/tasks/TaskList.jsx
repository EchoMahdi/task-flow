import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Typography,
  Chip,
  IconButton,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DateDisplay from '../../ui/DateDisplay';


function TaskList({ tasks, onToggleComplete, onEdit, onDelete, loading }) {
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'success',
    };
    return colors[priority] || 'default';
  };

  if (tasks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
        <Typography variant="body1">
          No tasks found. Create a new task to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {tasks.map((task) => (
        <Card
          key={task.id}
          sx={{
            opacity: task.is_completed ? 0.6 : 1,
            transition: 'opacity 0.2s'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Checkbox
                checked={task.is_completed}
                onChange={() => onToggleComplete(task)}
                disabled={loading}
                sx={{ mt: 0.5 }}
              />
              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      textDecoration: task.is_completed ? 'line-through' : 'none',
                      color: task.is_completed ? 'text.secondary' : 'text.primary'
                    }}
                  >
                    {task.title}
                  </Typography>
                  <Chip
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </Box>
                
                {task.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 1,
                      textDecoration: task.is_completed ? 'line-through' : 'none'
                    }}
                  >
                    {task.description}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  {task.due_date && (
                     <DateDisplay date={due_date} variant="compact" />
                  )}
                  
                  {task.tags && task.tags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {task.tags.map((tag) => (
                        <Chip
                          key={tag.id}
                          label={tag.name}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderLeft: `3px solid ${tag.color}`,
                            borderRadius: 1
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  onClick={() => onEdit(task)}
                  disabled={loading}
                  color="primary"
                  size="small"
                  aria-label="edit task"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(task.id)}
                  disabled={loading}
                  color="error"
                  size="small"
                  aria-label="delete task"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export default TaskList;
