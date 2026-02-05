import { format } from 'date-fns'

function TaskList({ tasks, onToggleComplete, onEdit, onDelete, loading }) {
  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks found. Create a new task to get started!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`bg-white rounded-lg shadow p-4 ${
            task.is_completed ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={task.is_completed}
              onChange={() => onToggleComplete(task)}
              disabled={loading}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`text-lg font-medium ${
                    task.is_completed ? 'line-through text-gray-500' : ''
                  }`}
                >
                  {task.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    priorityColors[task.priority]
                  }`}
                >
                  {task.priority}
                </span>
              </div>
              
              {task.description && (
                <p
                  className={`text-gray-600 mb-2 ${
                    task.is_completed ? 'line-through' : ''
                  }`}
                >
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {task.due_date && (
                  <span>Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                )}
                
                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1">
                    {task.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100"
                        style={{ borderLeft: `3px solid ${tag.color}` }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(task)}
                disabled={loading}
                className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task.id)}
                disabled={loading}
                className="text-red-500 hover:text-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TaskList
