import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext.jsx'
import { taskService } from '../services/taskService'
import { tagService } from '../services/tagService'
import TaskList from '../components/tasks/TaskList.jsx'
import TaskForm from '../components/tasks/TaskForm.jsx'
import TaskFilters from '../components/tasks/TaskFilters.jsx'

// Simple toast notification hook
function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }

  return { toasts, addToast }
}

function Dashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filters, setFilters] = useState({})
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const { toasts, addToast } = useToast()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [authLoading, isAuthenticated])

  // Tasks query
  const { 
    data: tasksData, 
    isLoading: tasksLoading, 
    error: tasksError 
  } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskService.getTasks(filters),
    enabled: isAuthenticated,
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  })

  // Tags query
  const { 
    data: tagsData, 
    isLoading: tagsLoading,
    error: tagsError 
  } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagService.getTags(),
    enabled: isAuthenticated,
    retry: 1,
    staleTime: 300000, // Cache for 5 minutes
  })

  // Mutations with toast notifications
  const createMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['tasks'])
      setShowCreateForm(false)
      addToast(data.message || 'Task created successfully', 'success')
    },
    onError: (error) => {
      addToast(error.response?.data?.message || 'Failed to create task', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => taskService.updateTask(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['tasks'])
      setEditingTask(null)
      addToast(data.message || 'Task updated successfully', 'success')
    },
    onError: (error) => {
      addToast(error.response?.data?.message || 'Failed to update task', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['tasks'])
      addToast(data.message || 'Task deleted successfully', 'success')
    },
    onError: (error) => {
      addToast(error.response?.data?.message || 'Failed to delete task', 'error')
    },
  })

  const completeMutation = useMutation({
    mutationFn: taskService.completeTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['tasks'])
      addToast(data.message || 'Task marked as completed', 'success')
    },
    onError: (error) => {
      addToast(error.response?.data?.message || 'Failed to complete task', 'error')
    },
  })

  const incompleteMutation = useMutation({
    mutationFn: taskService.incompleteTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['tasks'])
      addToast(data.message || 'Task marked as incomplete', 'info')
    },
    onError: (error) => {
      addToast(error.response?.data?.message || 'Failed to update task', 'error')
    },
  })

  const handleCreateTask = async (data) => {
    await createMutation.mutateAsync(data)
  }

  const handleUpdateTask = async (data) => {
    await updateMutation.mutateAsync({ id: editingTask.id, data })
  }

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleComplete = async (task) => {
    if (task.is_completed) {
      await incompleteMutation.mutateAsync(task.id)
    } else {
      await completeMutation.mutateAsync(task.id)
    }
  }

  // Extract data from responses
  const tasks = tasksData?.data || []
  const tags = tagsData?.data || []
  const meta = tasksData?.meta

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (tasksError || tagsError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error Loading Data</p>
            <p>{tasksError?.message || tagsError?.message || 'An unexpected error occurred'}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-md flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-green-100 text-green-700 border border-green-400' :
              toast.type === 'error' ? 'bg-red-100 text-red-700 border border-red-400' :
              'bg-blue-100 text-blue-700 border border-blue-400'
            }`}
          >
            {toast.type === 'success' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Todo List</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 hidden sm:inline">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              disabled={authLoading}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8 flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <button
              onClick={() => setShowCreateForm(true)}
              disabled={createMutation.isPending}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
            
            <TaskFilters 
              tags={tags} 
              filters={filters} 
              onFilterChange={setFilters}
            />
          </aside>

          {/* Task List */}
          <section className="flex-1">
            {showCreateForm && (
              <TaskForm
                tags={tags}
                onSubmit={handleCreateTask}
                onCancel={() => setShowCreateForm(false)}
                loading={createMutation.isPending}
              />
            )}

            {editingTask && (
              <TaskForm
                task={editingTask}
                tags={tags}
                onSubmit={handleUpdateTask}
                onCancel={() => setEditingTask(null)}
                loading={updateMutation.isPending}
              />
            )}

            {tasksLoading || tagsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-white rounded-lg shadow p-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <p className="text-gray-600 text-lg mb-2">No tasks found</p>
                  <p className="text-gray-500 text-sm mb-4">
                    {Object.keys(filters).length > 0 
                      ? 'Try adjusting your filters'
                      : 'Create your first task to get started!'}
                  </p>
                  {Object.keys(filters).length > 0 && (
                    <button
                      onClick={() => setFilters({})}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                onToggleComplete={handleToggleComplete}
                onEdit={setEditingTask}
                onDelete={handleDeleteTask}
                loading={deleteMutation.isPending || completeMutation.isPending || incompleteMutation.isPending}
              />
            )}

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {meta.current_page > 1 && (
                  <button
                    onClick={() => setFilters({ ...filters, page: meta.current_page - 1 })}
                    className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                    disabled={tasksLoading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                )}
                <span className="px-4 py-2 text-gray-600">
                  Page {meta.current_page} of {meta.last_page}
                </span>
                {meta.current_page < meta.last_page && (
                  <button
                    onClick={() => setFilters({ ...filters, page: meta.current_page + 1 })}
                    className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                    disabled={tasksLoading}
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
