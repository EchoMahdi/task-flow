import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';

// ============================================================================
// PageHeader Component
// ============================================================================
const PageHeader = ({
  title,
  description,
  actions,
  breadcrumbs,
  className = '',
}) => {
  return (
    <Box className={className} sx={{ mb: 4 }}>
      {breadcrumbs && (
        <Breadcrumbs
          separator="›"
          sx={{ mb: 2 }}
          aria-label="breadcrumb"
        >
          {breadcrumbs.map((crumb, index) => (
            <Box key={index} component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              {index > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mx: 1 }}
                >
                  /
                </Typography>
              )}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  color="inherit"
                  underline="hover"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ fontWeight: 500 }}
                >
                  {crumb.label}
                </Typography>
              )}
            </Box>
          ))}
        </Breadcrumbs>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
