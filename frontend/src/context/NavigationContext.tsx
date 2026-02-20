/**
 * NavigationContext - Backward Compatibility Layer
 * 
 * This file re-exports Zustand store hooks for backward compatibility.
 * New code should import directly from '@/stores/navigationStore'
 * 
 * @deprecated Import from '@/stores/navigationStore' instead
 */

import { useNavigationStore } from '@/stores/navigationStore'

// Types for backward compatibility
export interface NavigationState {
  type: 'project' | 'filter' | 'tag' | 'saved-view' | null
  id: string | null
  name: string | null
  params: Record<string, unknown> | null
}

// Re-export Zustand hooks for backward compatibility
export const useNavigation = () => {
  const currentNavigation = useNavigationStore((state) => state.currentNavigation)
  const setNavigation = useNavigationStore((state) => state.setNavigation)
  const clearNavigation = useNavigationStore((state) => state.clearNavigation)
  const isActive = useNavigationStore((state) => state.isActive)
  
  return {
    currentNavigation,
    setNavigation,
    clearNavigation,
    isActive,
  }
}

// Hook to set current navigation with automatic URL updates
export const useSetNavigation = () => {
  const setNavigation = useNavigationStore((state) => state.setNavigation)
  
  return (navigation: NavigationState) => {
    setNavigation(navigation)
  }
}

// Provider is no longer needed - Zustand works without providers
export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export default useNavigation
