import React, { useState, useCallback } from 'react';
import { useTranslation } from '../context/I18nContext';
import { TaskCalendar, CalendarTaskItem } from '../components/tasks';
import TaskModal from '../components/tasks/TaskModal';
import toastService from '../services/toastService';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Calendar Page
 * 
 * Full calendar view for task management with:
 * - Day/Week/Month views
 * - Drag & drop task rescheduling
 * - Task creation and editing
 * - Filtering
 */
const CalendarPage = () => {
  const { t } = useTranslation();
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  
  // Handle task click
  const handleTaskClick = useCallback((task) => {
    setSelectedTask(task);
    setModalMode('view');
    setModalOpen(true);
  }, []);
  
  // Handle task edit
  const handleTaskEdit = useCallback((task) => {
    setSelectedTask(task);
    setModalMode('edit');
    setModalOpen(true);
  }, []);
  
  // Handle create task
  const handleCreateTask = useCallback((date) => {
    setSelectedTask({
      due_date: date ? new Date(date).toISOString() : new Date().toISOString(),
    });
    setModalMode('create');
    setModalOpen(true);
  }, []);
  
  // Handle task save
  const handleTaskSave = useCallback((task, mode) => {
    if (mode === 'create') {
      toastService.success(t('tasks.created'));
    } else if (mode === 'edit') {
      toastService.success(t('tasks.updated'));
    }
    setModalOpen(false);
    setSelectedTask(null);
  }, [t]);
  
  // Handle task delete
  const handleTaskDelete = useCallback((task) => {
    toastService.success(t('tasks.deleted'));
    setModalOpen(false);
    setSelectedTask(null);
  }, [t]);
  
  // Handle modal close
  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedTask(null);
  }, []);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      p: 3 
    }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: 'text.primary', m: 0 }}>
            {t('navigation.calendar')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', m: 0 }}>
            {t('calendar.subtitle')}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <TaskCalendar
          onTaskClick={handleTaskClick}
          onTaskEdit={handleTaskEdit}
          onCreateTask={handleCreateTask}
          defaultView="month"
        />
      </Box>
      
      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          task={selectedTask}
          mode={modalMode}
          onClose={handleModalClose}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
        />
      )}
    </Box>
  );
};

export default CalendarPage;
