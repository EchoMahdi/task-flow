import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

// Public Pages
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'

// Authenticated Pages
import Dashboard from './pages/Dashboard.jsx'
import TaskList from './pages/TaskList.jsx'
import TaskForm from './pages/TaskForm.jsx'
import TaskDetails from './pages/TaskDetails.jsx'
import Notifications from './pages/Notifications.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'

// Error Pages
import { NotFound, Unauthorized, ServerError, LoadingPage } from './pages/ErrorPages.jsx'

// Route Guards
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingPage message="Authenticating..." />
  }
  
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingPage message="Loading..." />
  }
  
  return user ? <Navigate to="/dashboard" /> : children
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        } 
      />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } 
      />
      <Route 
        path="/reset-password" 
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } 
      />

      {/* Authenticated Routes */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      
      {/* Task Routes */}
      <Route 
        path="/tasks" 
        element={
          <PrivateRoute>
            <TaskList />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/tasks/new" 
        element={
          <PrivateRoute>
            <TaskForm />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/tasks/:id" 
        element={
          <PrivateRoute>
            <TaskDetails />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/tasks/:id/edit" 
        element={
          <PrivateRoute>
            <TaskForm />
          </PrivateRoute>
        } 
      />

      {/* Other Authenticated Routes */}
      <Route 
        path="/notifications" 
        element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } 
      />

      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/error" element={<ServerError />} />
      
      {/* 404 - Must be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
