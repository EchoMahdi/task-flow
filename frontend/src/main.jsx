import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { StyledEngineProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { router } from './router'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import { ThemeProvider , MUIThemeProvider } from './theme'
import { I18nProvider } from './context/I18nContext.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider persistToAPI={true}>
        <MUIThemeProvider>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <I18nProvider>
              <AuthProvider>
                <ToastProvider>
                  <RouterProvider router={router} />
                </ToastProvider>
              </AuthProvider>
            </I18nProvider>
          </QueryClientProvider>
        </MUIThemeProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>,
)
