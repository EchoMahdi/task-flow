/**
 * Main Application Entry Point
 * 
 * This file bootstraps the React application with all necessary providers.
 * State management is now handled by Zustand stores instead of Context API.
 * 
 * NOTE: Store initialization is handled by StoreInitializer component,
 * do NOT call useAuthStore.getState().initialize() here to avoid duplicate calls.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { StyledEngineProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { router } from './router'
import { ToastProvider } from './components/ui/Toast.jsx'
import { ThemeProvider, MUIThemeProvider } from './theme'
import { StoreInitializer } from './stores'
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

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
   (
    <Box sx={{ display: 'flex' ,justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider>
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
      </ThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>,
)
