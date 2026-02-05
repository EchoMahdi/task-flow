import React, { useState, useCallback } from 'react';
import { useTranslation } from '../context/I18nContext';
import { TaskCalendar, CalendarTaskItem } from '../components/tasks';
import TaskModal from '../components/tasks/TaskModal';
import toastService from '../services/toastService';

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
    <div className="calendar-page">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">{t('navigation.calendar')}</h1>
          <p className="page-subtitle">{t('calendar.subtitle')}</p>
        </div>
      </div>
      
      <div className="page-content">
        <TaskCalendar
          onTaskClick={handleTaskClick}
          onTaskEdit={handleTaskEdit}
          onCreateTask={handleCreateTask}
          defaultView="month"
        />
      </div>
      
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
      
      <style>{`
        .calendar-page {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 20px;
        }
        
        .page-header {
          margin-bottom: 20px;
        }
        
        .page-title-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }
        
        .page-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
        
        .page-content {
          flex: 1;
          min-height: 0;
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;
