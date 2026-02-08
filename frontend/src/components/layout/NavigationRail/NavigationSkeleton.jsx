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

/**
 * Skeleton for a single nav item
 */
export const NavItemSkeleton = ({ collapsed }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      px: 1.5,
      py: 0.75,
      minHeight: 36,
    }}
  >
    <Skeleton
      variant="circular"
      width={24}
      height={24}
      sx={{ flexShrink: 0 }}
    />
    {!collapsed && (
      <>
        <Skeleton
          variant="text"
          width="60%"
          sx={{ ml: 1.5, flex: 1 }}
        />
        <Skeleton
          variant="rounded"
          width={20}
          height={16}
          sx={{ ml: 1 }}
        />
      </>
    )}
  </Box>
);

/**
 * Skeleton for a nav section
 */
export const NavSectionSkeleton = ({ title = true, itemCount = 4, collapsed }) => (
  <Box sx={{ mb: 1 }}>
    {title && (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          py: 1,
          minHeight: 40,
        }}
      >
        <Skeleton variant="circular" width={20} height={20} />
        {!collapsed && (
          <Skeleton variant="text" width="40%" sx={{ ml: 1 }} />
        )}
      </Box>
    )}
    <Stack spacing={0.5} sx={{ pl: collapsed ? 0 : 2 }}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <NavItemSkeleton key={index} collapsed={collapsed} />
      ))}
    </Stack>
  </Box>
);

/**
 * Skeleton for the user section
 */
export const UserSectionSkeleton = ({ collapsed }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      px: 1.5,
      py: 1.5,
      minHeight: 56,
    }}
  >
    <Skeleton
      variant="circular"
      width={40}
      height={40}
      sx={{ flexShrink: 0 }}
    />
    {!collapsed && (
      <Box sx={{ ml: 1.5, flex: 1 }}>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" height={14} />
      </Box>
    )}
  </Box>
);

/**
 * Full navigation skeleton loader
 */
const NavigationSkeleton = ({ collapsed = false }) => {
  return (
    <Box sx={{ p: 1 }}>
      {/* User Section */}
      <UserSectionSkeleton collapsed={collapsed} />
      
      {/* Filters Section */}
      <NavSectionSkeleton title="Filters" itemCount={3} collapsed={collapsed} />
      
      {/* Favorites Section */}
      <NavSectionSkeleton title="Favorites" itemCount={2} collapsed={collapsed} />
      
      {/* Projects Section */}
      <NavSectionSkeleton title="Projects" itemCount={4} collapsed={collapsed} />
      
      {/* Tags Section */}
      <NavSectionSkeleton title="Tags" itemCount={3} collapsed={collapsed} />
      
      {/* Bottom Section */}
      <Box sx={{ mt: 2 }}>
        <NavItemSkeleton collapsed={collapsed} />
      </Box>
    </Box>
  );
};

export default NavigationSkeleton;
