import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "../components/layout/index";
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
  Skeleton,
} from "@mui/material";
import PageHeader from "../components/ui/PageHeader";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { tagService } from "../services/tagService";
import { taskOptionsService } from "../services/taskOptionsService";
import { TaskModel, ValidationError } from "../models/TaskModel";
import TaskPreviewDialog from "../components/domain/Task/TaskPreviewDialog";

const TaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Use TaskModel for data management
  const [taskModel] = useState(
    () =>
      new TaskModel({
        status: "pending",
        priority: "medium",
      }),
  );

  // Local form state synced with model
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    dueTime: "",
    selectedTags: [],
    notes: "",
  });
  const [modelErrors, setModelErrors] = useState({});
  const [tagInput, setTagInput] = useState("");

  // Preview dialog state
  const [showPreview, setShowPreview] = useState(false);

  // Load tags from backend
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsData = await tagService.getTags();
        setTags(tagsData.data || []);
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };

    fetchTags();
  }, []);

  // Load task options (statuses, priorities) from backend
  // DUPLICATION: Same pattern in TaskModal.jsx and CalendarFilters.jsx - extract to useTaskOptions hook
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        console.log('[TaskForm] DEBUG: Fetching options (DUPLICATED PATTERN)');
        setOptionsLoading(true);
        const optionsData = await taskOptionsService.getOptions();
        setStatusOptions(optionsData.data.statuses || []);
        setPriorityOptions(optionsData.data.priorities || []);
      } catch (err) {
        console.error("Failed to fetch task options:", err);
        console.log('[TaskForm] DEBUG: Using fallback options (DUPLICATED in TaskModal.jsx, CalendarFilters.jsx)');
        // Fallback to default options if API fails
        setStatusOptions([
          { value: "pending", label: "Pending", color: "default" },
          { value: "in_progress", label: "In Progress", color: "primary" },
          { value: "completed", label: "Completed", color: "success" },
        ]);
        setPriorityOptions([
          { value: "low", label: "Low", color: "success" },
          { value: "medium", label: "Medium", color: "warning" },
          { value: "high", label: "High", color: "error" },
          { value: "urgent", label: "Urgent", color: "error" },
        ]);
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // Load task data from backend if editing
  useEffect(() => {
    const loadTask = async () => {
      if (!isEditing) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await taskModel.loadForEdit(id);

        // Sync model data to form state
        const data = taskModel.getData();
        setFormData({
          title: data.title || "",
          description: data.description || "",
          status: data.status || "pending",
          priority: data.priority || "medium",
          dueDate: data.dueDate || "",
          dueTime: data.dueTime || "",
          selectedTags: data.tags || [],
          notes: "",
        });
      } catch (err) {
        console.error("Failed to fetch task:", err);
        setError("Failed to load task data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id, isEditing, taskModel]);

  // Sync form changes to model
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Update model
    taskModel.set(name, value);

    // Clear errors
    setModelErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      delete updated.server;
      return updated;
    });

    if (error) {
      setError("");
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.selectedTags.includes(newTag)) {
        const updatedTags = [...formData.selectedTags, newTag];
        setFormData((prev) => ({ ...prev, selectedTags: updatedTags }));
        taskModel.set("tags", updatedTags);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = formData.selectedTags.filter(
      (tag) => tag !== tagToRemove,
    );
    setFormData((prev) => ({
      ...prev,
      selectedTags: updatedTags,
    }));
    taskModel.set("tags", updatedTags);
  };

  // Validate using TaskModel
  const validate = useCallback(() => {
    taskModel.validate();
    const errors = taskModel.getErrors();
    setModelErrors(errors);
    return !taskModel.hasErrors();
  }, [taskModel]);

  // Handle form submission using TaskModel
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    setError("");
    setModelErrors({});

    try {
      if (isEditing) {
        await taskModel.update(parseInt(id, 10));
      } else {
        await taskModel.create();
      }

      navigate("/tasks");
    } catch (err) {
      console.error("Failed to save task:", err);

      if (err instanceof ValidationError) {
        setModelErrors(err.validationErrors || {});
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to save task. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || optionsLoading) {
    return (
      <AppLayout>
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Skeleton variant="text" width="30%" height={32} />
            <Skeleton variant="rounded" height={300} />
          </Box>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <PageHeader
          title={isEditing ? "Edit Task" : "Create New Task"}
          description={
            isEditing
              ? "Update the task details below"
              : "Fill in the details to create a new task"
          }
          breadcrumbs={[
            { label: "Tasks", href: "/tasks" },
            { label: isEditing ? "Edit" : "New" },
          ]}
        />

        {(error || Object.keys(modelErrors).length > 0) && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            icon={<WarningAmberIcon sx={{ fontSize: 20 }} />}
            onClose={() => {
              setError("");
              setModelErrors({});
            }}
          >
            {error || "Please fix the errors below"}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Card>
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              {/* Title */}
              <TextField
                label="Task Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
                error={Boolean(modelErrors.title)}
                helperText={modelErrors.title}
                autoFocus
                fullWidth
                disabled={saving}
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
                disabled={saving}
                error={Boolean(modelErrors.description)}
              />

              {/* Status & Priority */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <FormControl fullWidth error={Boolean(modelErrors.status)}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                    disabled={saving}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth error={Boolean(modelErrors.priority)}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    label="Priority"
                    disabled={saving}
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
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Due Date"
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  error={Boolean(modelErrors.dueDate)}
                  helperText={modelErrors.dueDate}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={saving}
                />
                <TextField
                  label="Due Time (Optional)"
                  type="time"
                  name="dueTime"
                  value={formData.dueTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={saving}
                />
              </Box>

              {/* Tags */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Tags
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {formData.selectedTags.map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId);
                    return (
                      <Chip
                        key={tagId}
                        color="primary"
                        label={`#${tag?.name || tagId}`}
                        onDelete={() => handleRemoveTag(tagId)}
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                        disabled={saving}
                      />
                    );
                  })}
                  {(!formData.selectedTags ||
                    formData.selectedTags.length === 0) && (
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontStyle: "italic" }}
                    >
                      No tags
                    </Typography>
                  )}
                </Box>
                <TextField
                  placeholder="Type a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  helperText="Press Enter to add a tag"
                  size="small"
                  fullWidth
                  disabled={saving}
                />
                {modelErrors.tags && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    {modelErrors.tags}
                  </Typography>
                )}
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
                disabled={saving}
              />
            </CardContent>

            {/* Footer */}
            <Box
              sx={{
                px: 3,
                py: 2,
                bgcolor: "action.hover",
                borderTop: 1,
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Button
                type="button"
                variant="text"
                onClick={() => navigate("/tasks")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setShowPreview(true)}
                    disabled={saving}
                  >
                    Preview
                  </Button>
                )}
                <Button type="submit" variant="contained" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : isEditing
                      ? "Save Changes"
                      : "Create Task"}
                </Button>

                <TaskPreviewDialog
                  open={showPreview}
                  onClose={() => setShowPreview(false)}
                  taskData={formData}
                  tags={tags}
                  onEdit={() => setShowPreview(false)}
                />
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>
    </AppLayout>
  );
};

export default TaskForm;
