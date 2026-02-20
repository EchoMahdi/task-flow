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
import { useTranslation } from "@/context/I18nContext";

/**
 * Sort tasks by date
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
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filters.showCompleted === false) {
      result = result.filter((task) => !task.completed);
    } else if (filters.showCompleted === true) {
      result = result.filter((task) => task.completed);
    }

    if (filters.priority && filters.priority !== "all") {
      result = result.filter((task) => task.priority === filters.priority);
    }

    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((task) =>
        task.tags?.some((tag) => filters.tags.includes(tag.id)),
      );
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query),
      );
    }

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
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });
    return groups;
  }, [filteredTasks, filters.groupBy]);

  const handleAddTask = (taskData) => {
    if (onAddTask) onAddTask(taskData);
  };

  const handleToggleShowCompleted = () => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        showCompleted: filters.showCompleted === false ? undefined : false,
      });
    }
  };

  // ─── Empty State ───────────────────────────────────────────────────────────
  if (tasks.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          gap: 2,
        }}
      >
        <Assignment sx={{ fontSize: 48, color: "text.disabled" }} />
        <Typography variant="h6" color="text.secondary">
          {t("No tasks yet")}
        </Typography>
        <Typography variant="body2" color="text.disabled">
          {t("Create your first task to get started")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsExpanded(true)}
        >
          {t("Add your first task")}
        </Button>
        {isExpanded && <QuickAddBar onAdd={handleAddTask} autoFocus />}
      </Box>
    );
  }

  // ─── Main View ─────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Quick Add Bar */}
      <QuickAddBar onAdd={handleAddTask} />

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        // No results
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Search sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {t("No tasks match your filters")}
          </Typography>
        </Box>
      ) : filters.groupBy ? (
        // Grouped view
        <Stack spacing={2}>
          {Object.entries(groupedTasks).map(([groupDate, groupTasks]) => (
            <Box key={groupDate}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ px: 1, mb: 0.5, display: "block" }}
              >
                {groupDate === "no-date" ? t("No due date") : groupDate}
              </Typography>
              <Paper variant="outlined">
                {groupTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <TaskRow
                      task={task}
                      onToggle={onToggleTask}
                      onUpdate={onUpdateTask}
                      onDelete={onDeleteTask}
                      onOpenDetail={onOpenDetail}
                    />
                    {index < groupTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Paper>
            </Box>
          ))}
        </Stack>
      ) : (
        // Flat view
        <Paper variant="outlined">
          {filteredTasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <TaskRow
                task={task}
                onToggle={onToggleTask}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onOpenDetail={onOpenDetail}
              />
              {index < filteredTasks.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Paper>
      )}

      {/* Footer */}
      {filteredTasks.length > 0 && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1, pt: 0.5 }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("taskCount", { count: filteredTasks.length })}
          </Typography>
          {filters.showCompleted === false && (
            <Button size="small" onClick={handleToggleShowCompleted}>
              {t("Show completed")}
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
};

TaskList.displayName = "TaskList";
export default TaskList;
