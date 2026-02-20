/**
 * Router Context Provider
 * 
 * Provides router context for the application when using Data Router.
 * This bridges the gap between the data router and React context.
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouteError, useNavigate, useLocation } from 'react-router-dom'

const RouterContext = createContext(null)

/**
 * Provider component that wraps the application with router context
 */
export function RouterContextProvider({ children }) {
  const [contextValue, setContextValue] = useState({
    navigation: null,
    location: null,
  })

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  )
}

/**
 * Hook to access router context
 */
export function useRouterContext() {
  return useContext(RouterContext)
}

/**
 * Error handler component for route errors
 */
export function RouteErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()
  const location = useLocation()
  
  useEffect(() => {
    console.error('Route error:', error)
    
    // Handle specific error types
    if (error?.status === 401) {
      // Unauthorized - redirect to login
      navigate('/app/login', { 
        state: { from: location.pathname },
        replace: true 
      })
    } else if (error?.status === 403) {
      // Forbidden - redirect to unauthorized
      navigate('/app/unauthorized', { replace: true })
    } else if (error?.status === 404) {
      // Not found - redirect to 404
      navigate('/app/not-found', { replace: true })
    }
  }, [error, navigate, location])
  
  // Return null as we're redirecting
  return null
}

/**
 * Data router hook - provides access to router data
 * Works with both BrowserRouter and Data Router
 */
export function useRouterData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  
  useEffect(() => {
    // This would be populated by the loader in data router
    // For now, we'll get data from the auth context
    setLoading(false)
  }, [location.pathname])
  
  return { data, loading }
}

/**
 * Navigation hook with additional utilities
 */
export function useAppNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  
  return {
    navigate,
    location,
    goTo: (path) => navigate(path),
    goBack: () => navigate(-1),
    replace: (path) => navigate(path, { replace: true }),
    withState: (path, state) => navigate(path, { state }),
    getRedirectUrl: () => {
      const params = new URLSearchParams(location.search)
      return params.get('redirect') || '/app/dashboard'
    },
  }
}

export default {
  RouterContextProvider,
  useRouterContext,
  RouteErrorBoundary,
  useRouterData,
  useAppNavigation,
}
