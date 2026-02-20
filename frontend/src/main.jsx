/**
 * Main Application Entry Point
 * 
 * This file bootstraps the React application with all necessary providers.
 * State management is now handled by Zustand stores instead of Context API.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { StyledEngineProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { router } from './router'
import { ToastProvider } from './components/ui/Toast.jsx'
import { MUIThemeProvider } from './theme'
import { StoreInitializer } from './stores'
import { useAuthStore } from './stores/authStore'

// Initialize stores on app load
useAuthStore.getState().initialize()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * App Loading Fallback
 * Displayed while stores are initializing
 */
const AppLoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" style={{
        width: '40px',
        height: '40px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px',
      }} />
      <p style={{ color: '#666' }}>Loading...</p>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <StoreInitializer fallback={<AppLoadingFallback />}>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </StoreInitializer>
        </QueryClientProvider>
      </MUIThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>,
)
