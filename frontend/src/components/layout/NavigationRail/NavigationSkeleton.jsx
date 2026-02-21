/**
 * ============================================================================
 * Navigation Skeleton Components
 * Skeleton loaders for navigation sections
 * ============================================================================
 */

import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useI18nStore } from '@/stores/i18nStore';

/**
 * Skeleton for a single nav item
 */
export const NavItemSkeleton = ({ collapsed }) => (
  <Box
    className="nav-item nav-item--skeleton"
    sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75 }}
  >
    <Skeleton variant="circular" width={20} height={20} />
    {!collapsed && (
      <>
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="rounded" width={24} height={18} sx={{ ml: 'auto' }} />
      </>
    )}
  </Box>
);

/**
 * Skeleton for a nav section
 */
export const NavSectionSkeleton = ({
  title = true,
  itemCount = 4,
  collapsed,
}) => (
  <Box className="nav-section nav-section--skeleton">
    {title && (
      <Box
        className="nav-section__header"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75 }}
      >
        <Skeleton variant="circular" width={18} height={18} />
        {!collapsed && <Skeleton variant="text" width="40%" height={20} />}
      </Box>
    )}

    <Box className="nav-section__content">
      {Array.from({ length: itemCount }).map((_, index) => (
        <NavItemSkeleton key={index} collapsed={collapsed} />
      ))}
    </Box>
  </Box>
);

/**
 * Skeleton for the user section
 */
export const UserSectionSkeleton = ({ collapsed }) => (
  <Box
    className="nav-user nav-user--skeleton"
    sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1 }}
  >
    <Skeleton variant="circular" width={36} height={36} />
    {!collapsed && (
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height={18} />
        <Skeleton variant="text" width="45%" height={16} />
      </Box>
    )}
  </Box>
);

/**
 * Full navigation skeleton loader
 */
const NavigationSkeleton = ({ collapsed = false }) => {
  const t = useI18nStore((state) => state.t);

  return (
    <Box
      aria-label={t('Loading navigation')}
      aria-busy="true"
      role="status"
      sx={{ width: '100%' }}
    >
      {/* User Section */}
      <UserSectionSkeleton collapsed={collapsed} />

      <Stack spacing={1} sx={{ mt: 1 }}>
        {/* Filters Section */}
        <NavSectionSkeleton title={true} itemCount={4} collapsed={collapsed} />

        {/* Favorites Section */}
        <NavSectionSkeleton title={true} itemCount={3} collapsed={collapsed} />

        {/* Projects Section */}
        <NavSectionSkeleton title={true} itemCount={5} collapsed={collapsed} />

        {/* Tags Section */}
        <NavSectionSkeleton title={true} itemCount={4} collapsed={collapsed} />
      </Stack>

      {/* Bottom Section */}
      <Box sx={{ mt: 2, px: 1.5 }}>
        <Skeleton variant="rounded" width="100%" height={36} />
      </Box>
    </Box>
  );
};

export default NavigationSkeleton;
