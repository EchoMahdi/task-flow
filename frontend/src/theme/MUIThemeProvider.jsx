/**
 * MUI Theme Integration
 * 
 * Bridges the centralized Theme Manager with Material-UI's theming system.
 * MUI components will use our semantic tokens while maintaining full MUI functionality.
 */

import { createTheme } from '@mui/material/styles';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { useContext, useMemo, useEffect, createContext } from 'react';
import { useTheme as useCentralTheme } from './ThemeProvider';
import { 
  colorsLight, 
  colorsDark, 
  fonts, 
  fontSizes, 
  fontWeights, 
  lineHeights,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
} from './tokens';

// ============================================================================
// CONTEXT
// ============================================================================

const MUIThemeContext = createContext(null);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse spacing value to pixels
 */
function getSpacingPixels(factor) {
  const value = spacing[factor];
  if (value) {
    return parseFloat(value) * 16;
  }
  return factor * 4; // fallback: 0.25rem = 4px
}

/**
 * Parse breakpoint value to pixels
 */
function getBreakpointPixels(breakpoint) {
  const value = breakpoints[breakpoint];
  if (value) {
    return parseFloat(value) * 16;
  }
  return 0;
}

// ============================================================================
// THEME FACTORY
// ============================================================================

/**
 * Create MUI theme from centralized tokens
 * 
 * @param {string} mode - 'light' or 'dark'
 * @param {string} locale - 'en' or 'fa'
 * @param {Object} preferences - Accessibility preferences
 * @returns {Object} MUI theme object
 */
export function createMUITheme(mode, locale, preferences = {}) {
  const colors = mode === 'dark' ? colorsDark : colorsLight;
  const fontFamily = fonts[locale] || fonts.en;
  const isRTL = locale === 'fa';
  
  return createTheme({
    // Direction for RTL support
    direction: isRTL ? 'rtl' : 'ltr',
    
    // Palette from centralized tokens
    palette: {
      mode,
      primary: {
        main: colors.primary[600],
        light: colors.primary[400],
        dark: colors.primary[700],
        contrastText: colors.primary.contrastText,
      },
      secondary: {
        main: colors.secondary[500],
        light: colors.secondary[400],
        dark: colors.secondary[600],
        contrastText: colors.secondary.contrastText,
      },
      success: {
        main: colors.success[500],
        light: colors.success[400],
        dark: colors.success[600],
        contrastText: colors.success.contrastText,
      },
      warning: {
        main: colors.warning[500],
        light: colors.warning[400],
        dark: colors.warning[600],
        contrastText: colors.warning.contrastText,
      },
      error: {
        main: colors.error[500],
        light: colors.error[400],
        dark: colors.error[600],
        contrastText: colors.error.contrastText,
      },
      info: {
        main: colors.info[500],
        light: colors.info[400],
        dark: colors.info[600],
        contrastText: colors.info.contrastText,
      },
      background: {
        default: colors.background.primary,
        paper: colors.background.secondary,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
        disabled: colors.text.disabled,
      },
      divider: colors.border.default,
      action: {
        hover: colors.state.hover,
        selected: colors.state.selected,
        focus: colors.state.focus,
        disabled: colors.state.disabled,
        disabledBackground: colors.state.disabledBackground,
      },
    },
    
    // Typography from centralized tokens
    typography: {
      fontFamily: fontFamily.primary,
      fontSize: parseFloat(fontSizes.base) * 16,
      fontWeightLight: fontWeights.light,
      fontWeightRegular: fontWeights.normal,
      fontWeightMedium: fontWeights.medium,
      fontWeightBold: fontWeights.bold,
      htmlFontSize: 16,
      
      h1: {
        fontFamily: fontFamily.primary,
        fontWeight: fontWeights.bold,
        fontSize: fontSizes['4xl'],
        lineHeight: lineHeights.tight,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontFamily: fontFamily.primary,
        fontWeight: fontWeights.bold,
        fontSize: fontSizes['3xl'],
        lineHeight: lineHeights.tight,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontFamily: fontFamily.primary,
        fontWeight: fontWeights.semibold,
        fontSize: fontSizes['2xl'],
        lineHeight: lineHeights.tight,
      },
      h4: {
        fontFamily: fontFamily.primary,
        fontWeight: fontWeights.semibold,
        fontSize: fontSizes.xl,
        lineHeight: lineHeights.normal,
      },
      h5: {
        fontFamily: fontFamily.primary,
        fontWeight: fontWeights.semibold,
        fontSize: fontSizes.lg,
        lineHeight: lineHeights.normal,
      },
      h6: {
        fontFamily: fontFamily.primary,
        fontWeight: fontWeights.semibold,
        fontSize: fontSizes.base,
        lineHeight: lineHeights.normal,
      },
      subtitle1: {
        fontFamily: fontFamily.primary,
        fontWeight: fontWeights.medium,
        fontSize: fontSizes.base,
        lineHeight: lineHeights.relaxed,
      },
      subtitle2: {
        fontFamily: fontFamily.primary,
        fontWeight: fontWeights.medium,
        fontSize: fontSizes.sm,
        lineHeight: lineHeights.relaxed,
      },
      body1: {
        fontFamily: fontFamily.primary,
        fontWeight: fontWeights.normal,
        fontSize: fontSizes.base,
        lineHeight: lineHeights.relaxed,
      },
      body2: {
        fontFamily: fontFamily.primary,
        fontWeight: fontWeights.normal,
        fontSize: fontSizes.sm,
        lineHeight: lineHeights.relaxed,
      },
      caption: {
        fontFamily: fontFamily.primary,
        fontWeight: fontWeights.normal,
        fontSize: fontSizes.xs,
        lineHeight: lineHeights.normal,
      },
      overline: {
        fontFamily: fontFamily.primary,
        fontWeight: fontWeights.medium,
        fontSize: fontSizes.xs,
        lineHeight: lineHeights.normal,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      },
      button: {
        fontFamily: fontFamily.primary,
        fontWeight: fontWeights.medium,
        fontSize: fontSizes.sm,
        textTransform: 'none',
        lineHeight: lineHeights.normal,
      },
    },
    
    // Shape
    shape: {
      borderRadius: parseFloat(borderRadius.default) * 4,
    },
    
    // Shadows from centralized tokens
    shadows: [
      shadows.none,
      shadows.xs,
      shadows.sm,
      shadows.md,
      shadows.lg,
      shadows.xl,
      shadows['2xl'],
      ...Array(18).fill(shadows.none),
    ],
    
    // Spacing
    spacing: getSpacingPixels,
    
    // Breakpoints
    breakpoints: {
      values: {
        xs: 0,
        sm: getBreakpointPixels('sm'),
        md: getBreakpointPixels('md'),
        lg: getBreakpointPixels('lg'),
        xl: getBreakpointPixels('xl'),
        '2xl': getBreakpointPixels('2xl'),
      },
    },
    
    // Z-index
    zIndex: {
      mobileStepper: 1000,
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
    },
    
    // Component overrides
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // Apply global styles based on theme
          body: {
            scrollbarColor: mode === 'dark' 
              ? colors.neutral[600] + ' ' + colors.neutral[300] 
              : colors.neutral[200] + ' ' + colors.neutral[50],
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: '4px',
              backgroundColor: mode === 'dark' ? colors.neutral[600] : colors.neutral[200],
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              backgroundColor: mode === 'dark' ? colors.neutral[300] : colors.neutral[50],
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.default,
            padding: spacing[2] + ' ' + spacing[4],
            fontWeight: fontWeights.medium,
            transition: 'all 200ms ease-in-out',
          },
          sizeSmall: {
            padding: spacing[1] + ' ' + spacing[2],
            fontSize: fontSizes.sm,
          },
          sizeLarge: {
            padding: spacing[3] + ' ' + spacing[6],
            fontSize: fontSizes.base,
          },
          contained: {
            boxShadow: shadows.xs,
            '&:hover': {
              boxShadow: shadows.md,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: borderRadius.default,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.lg,
            boxShadow: shadows.sm,
            border: '1px solid ' + colors.border.light,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          rounded: {
            borderRadius: borderRadius.lg,
          },
          elevation1: {
            boxShadow: shadows.sm,
          },
          elevation2: {
            boxShadow: shadows.md,
          },
          elevation3: {
            boxShadow: shadows.lg,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: borderRadius.xl,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: borderRadius.sm,
            fontSize: fontSizes.sm,
            backgroundColor: colors.neutral[800],
            color: colors.neutral[0],
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.default,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.default,
          },
          standardSuccess: {
            backgroundColor: colors.success[50],
            color: colors.success[800],
          },
          standardError: {
            backgroundColor: colors.error[50],
            color: colors.error[800],
          },
          standardWarning: {
            backgroundColor: colors.warning[50],
            color: colors.warning[800],
          },
          standardInfo: {
            backgroundColor: colors.info[50],
            color: colors.info[800],
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: fontWeights.medium,
            minWidth: 'auto',
            padding: spacing[2] + ' ' + spacing[3],
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: '2px',
            borderRadius: borderRadius.sm,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: borderRadius.lg,
            boxShadow: shadows.lg,
            border: '1px solid ' + colors.border.light,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            padding: spacing[2] + ' ' + spacing[3],
            '&.Mui-selected': {
              backgroundColor: colors.state.selected,
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.default,
            margin: spacing[1] + ' ' + spacing[2],
            '&.Mui-selected': {
              backgroundColor: colors.state.selected,
            },
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' 
              ? colors.neutral[700] 
              : colors.neutral[200],
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.sm,
            height: '8px',
          },
          bar: {
            borderRadius: borderRadius.sm,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            padding: spacing[1],
          },
          switchBase: {
            '&.Mui-checked': {
              color: colors.primary[600],
              '& + .MuiSwitch-track': {
                backgroundColor: colors.primary[600],
                opacity: 0.5,
              },
            },
          },
          track: {
            backgroundColor: mode === 'dark' 
              ? colors.neutral[600] 
              : colors.neutral[300],
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: colors.border.strong,
            '&.Mui-checked': {
              color: colors.primary[600],
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: colors.border.strong,
            '&.Mui-checked': {
              color: colors.primary[600],
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background.secondary,
            color: colors.text.primary,
            boxShadow: shadows.xs,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.background.secondary,
            borderRight: isRTL ? 'none' : '1px solid ' + colors.border.light,
            borderLeft: isRTL ? '1px solid ' + colors.border.light : 'none',
          },
        },
      },
    },
  });
}

// ============================================================================
// PROVIDER
// ============================================================================

/**
 * MUIThemeProvider - Provides MUI theme synced with centralized theme manager
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} MUIThemeProvider component
 */
export function MUIThemeProvider({ children }) {
  const centralTheme = useCentralTheme();
  
  // Create MUI theme from central theme
  const muiTheme = useMemo(() => 
    createMUITheme(
      centralTheme.resolvedMode,
      centralTheme.locale,
      centralTheme.preferences
    ),
    [centralTheme.resolvedMode, centralTheme.locale, centralTheme.preferences]
  );
  
  // Apply theme to document for CSS overrides
  useEffect(() => {
    const root = document.documentElement;
    const colors = centralTheme.resolvedMode === 'dark' ? colorsDark : colorsLight;
    
    // Apply MUI CSS baseline overrides
    root.style.setProperty('--mui-palette-primary-main', colors.primary[600]);
    root.style.setProperty('--mui-palette-background-default', colors.background.primary);
    root.style.setProperty('--mui-palette-text-primary', colors.text.primary);
  }, [centralTheme.resolvedMode]);
  
  return (
    <MUIThemeContext.Provider value={muiTheme}>
      {children}
    </MUIThemeContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useMUIThemeFromManager - Get MUI theme synced with centralized theme manager
 * 
 * @returns {Object} MUI theme object
 * 
 * @example
 * const muiTheme = useMUIThemeFromManager();
 * <Box sx={{ color: muiTheme.palette.primary.main }} />
 */
export function useMUIThemeFromManager() {
  const context = useContext(MUIThemeContext);
  const centralTheme = useCentralTheme();
  const muiTheme = useMUITheme();
  
  // Return merged theme with central theme values
  return {
    ...muiTheme,
    central: centralTheme,
    palette: {
      ...muiTheme.palette,
      centralColors: centralTheme.colors,
    },
  };
}

export default MUIThemeProvider;
