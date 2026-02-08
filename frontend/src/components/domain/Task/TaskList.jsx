/**
 * ============================================================================
 * TaskList Component
 * Domain component for displaying a list of tasks
 * Supports filtering, sorting, and bulk actions
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import { Box, Typography, Button, Stack, Divider, Paper } from "@mui/material";
import { Add, Search, Assignment } from "@mui/icons-material";
import { TaskRow } from "./TaskRow";
import { QuickAddBar } from "./QuickAddBar";

/**
 * Sort tasks by date
 * @param {Array} tasks - Array of task objects
 * @param {string} sortBy - Sort field
 * @param {string} sortOrder - Sort order (asc|desc)
 */
const sortTasks = (tasks, sortBy, sortOrder) => {
  const sorted = [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "dueDate":
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate) - new Date(b.dueDate);
        break;
      case "priority":
        const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
        comparison =
          (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "created":
      default:
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  return sorted;
};

/**
 * TaskList Component
 *
 * @param {Object} props
 * @param {Array} props.tasks - Array of task objects
 * @param {Function} props.onToggleTask - Callback when task is toggled
 * @param {Function} props.onUpdateTask - Callback when task is updated
 * @param {Function} props.onDeleteTask - Callback when task is deleted
 * @param {Function} props.onOpenDetail - Callback when task detail should open
 * @param {Function} props.onAddTask - Callback when new task is added
 * @param {Object} props.filters - Current filters
 * @param {string} props.sortBy - Sort field
 * @param {string} props.sortOrder - Sort order
 */
const TaskList = ({
  tasks = [],
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onOpenDetail,
  onAddTask,
  filters = {},
  sortBy = "dueDate",
  sortOrder = "asc",
  onFilterChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by completed status
    if (filters.showCompleted === false) {
      result = result.filter((task) => !task.completed);
    } else if (filters.showCompleted === true) {
      result = result.filter((task) => task.completed);
    }

    // Filter by priority
    if (filters.priority && filters.priority !== "all") {
      result = result.filter((task) => task.priority === filters.priority);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((task) =>
        task.tags?.some((tag) => filters.tags.includes(tag.id)),
      );
    }

    // Filter by search query
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query),
      );
    }

    // Sort tasks
    result = sortTasks(result, sortBy, sortOrder);

    return result;
  }, [tasks, filters, sortBy, sortOrder]);

  // Group tasks by date if needed
  const groupedTasks = useMemo(() => {
    if (!filters.groupBy) return { all: filteredTasks };

    const groups = {};
    filteredTasks.forEach((task) => {
      const key = task.dueDate
        ? new Date(task.dueDate).toDateString()
        : "no-date";

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(task);
    });

    return groups;
  }, [filteredTasks, filters.groupBy]);

  // Handle add task
  const handleAddTask = (taskData) => {
    if (onAddTask) {
      onAddTask(taskData);
    }
  };

  // Handle toggle show completed
  const handleToggleShowCompleted = () => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        showCompleted: filters.showCompleted === false ? undefined : false,
      });
    }
  };

  // Empty state
  if (tasks.length === 0) {
    return (
      <Box>
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: "center",
            bgcolor: "background.default",
          }}
        >
          <Assignment
            sx={{
              fontSize: 64,
              color: "text.disabled",
              mb: 2,
            }}
          />
          <Typography variant="h6" gutterBottom>
            No tasks yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first task to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsExpanded(true)}
          >
            Add your first task
          </Button>
        </Paper>

        {isExpanded && (
          <Box sx={{ mt: 3 }}>
            <QuickAddBar onAddTask={handleAddTask} autoFocus />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Quick Add Bar */}
      <Box sx={{ mb: 3 }}>
        <QuickAddBar onAddTask={handleAddTask} autoFocus={false} />
      </Box>

      {/* Task List */}
      <Stack spacing={2}>
        {filteredTasks.length === 0 ? (
          // No results
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              bgcolor: "background.default",
            }}
          >
            <Search
              sx={{
                fontSize: 48,
                color: "text.disabled",
                mb: 2,
              }}
            />
            <Typography variant="body1" color="text.secondary">
              No tasks match your filters
            </Typography>
          </Paper>
        ) : filters.groupBy ? (
          // Grouped view
          <Stack spacing={3}>
            {Object.entries(groupedTasks).map(([groupDate, groupTasks]) => (
              <Box key={groupDate}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1.5, textTransform: "uppercase", fontSize: 12 }}
                >
                  {groupDate === "no-date" ? "No due date" : groupDate}
                </Typography>
                <Stack spacing={1}>
                  {groupTasks.map((task, index) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      index={index}
                      onToggle={onToggleTask}
                      onEdit={onUpdateTask}
                      onDelete={onDeleteTask}
                      onOpenDetail={onOpenDetail}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          // Flat view
          <Stack spacing={1}>
            {filteredTasks.map((task, index) => (
              <TaskRow
                key={task.id}
                task={task}
                index={index}
                onToggle={onToggleTask}
                onEdit={onUpdateTask}
                onDelete={onDeleteTask}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </Stack>
        )}
      </Stack>

      {/* Footer with task count */}
      {filteredTasks.length > 0 && (
        <Box
          sx={{
            mt: 3,
            pt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
          </Typography>
          {filters.showCompleted === false && (
            <Button size="small" onClick={handleToggleShowCompleted}>
              Show completed
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

TaskList.displayName = "TaskList";

export default TaskList;
