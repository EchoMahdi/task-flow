const taskConfig = {
  /**
   * Priority badge colors
   */
  priorityConfig: {
    high: { color: "#d32f2f", bgColor: "#ffebee", label: "High Priority" },
    medium: { color: "#f57c00", bgColor: "#fff3e0", label: "Medium Priority" },
    low: { color: "#388e3c", bgColor: "#e8f5e9", label: "Low Priority" },
  },

  /**
   * Status badge colors
   */
  statusConfig: {
    pending: { color: "#757575", bgColor: "#f5f5f5", label: "Pending" },
    in_progress: { color: "#1976d2", bgColor: "#e3f2fd", label: "In Progress" },
    completed: { color: "#388e3c", bgColor: "#e8f5e9", label: "Completed" },
  },
};

export { taskConfig }
export default taskConfig;
