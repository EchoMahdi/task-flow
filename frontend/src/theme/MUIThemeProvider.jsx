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
  searchColors,
  inputColors,
  inputHeights,
  touchTargets,
  iconButtonSizes,
  componentTokens,
  transitions,
  navigationRailColors,
  navigationRailSizes
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
            backgroundColor: colors.neutral[200],
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
      // ============================================
      // INPUT COMPONENTS
      // ============================================
      MuiInputBase: {
        styleOverrides: {
          root: {
            fontSize: fontSizes.sm,
            lineHeight: lineHeights.normal,
          },
          input: {
            '&::placeholder': {
              color: mode === 'dark' ? colors.text.tertiary : colors.text.tertiary,
              opacity: 1,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.default,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? colors.border.strong : colors.border.default,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary[600],
              borderWidth: '2px',
            },
          },
          input: {
            padding: spacing[2] + ' ' + spacing[3],
            height: 'unset',
            minHeight: inputHeights.medium,
          },
          notchedOutline: {
            borderColor: mode === 'dark' ? colors.border.default : colors.border.light,
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.default,
            backgroundColor: mode === 'dark' ? colors.background.tertiary : colors.background.primary,
            '&:hover': {
              backgroundColor: mode === 'dark' ? colors.background.tertiary : colors.background.primary,
            },
            '&.Mui-focused': {
              backgroundColor: mode === 'dark' ? colors.background.tertiary : colors.background.primary,
            },
          },
          input: {
            padding: spacing[2] + ' ' + spacing[3],
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: fontSizes.sm,
            fontWeight: fontWeights.medium,
            color: colors.text.secondary,
            '&.Mui-focused': {
              color: colors.primary[600],
            },
          },
          outlined: {
            transform: 'translate(14px, 16px) scale(1)',
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -8px) scale(0.85)',
            },
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: colors.text.secondary,
            fontWeight: fontWeights.medium,
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontSize: fontSizes.xs,
            color: colors.text.tertiary,
            '&.Mui-error': {
              color: colors.error[500],
            },
          },
        },
      },
      // ============================================
      // SELECT COMPONENTS
      // ============================================
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.default,
          },
          icon: {
            color: colors.text.tertiary,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            padding: spacing[2] + ' ' + spacing[3],
            minHeight: touchTargets.min,
            fontSize: fontSizes.sm,
            '&.Mui-selected': {
              backgroundColor: colors.state.selected,
              '&:hover': {
                backgroundColor: colors.state.selected,
              },
            },
          },
        },
      },
      // ============================================
      // BUTTON COMPONENTS
      // ============================================
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.default,
            padding: spacing[2] + ' ' + spacing[4],
            fontWeight: fontWeights.medium,
            fontSize: fontSizes.sm,
            textTransform: 'none',
            transition: 'all ' + transitions.normal,
            minHeight: touchTargets.min,
          },
          sizeSmall: {
            padding: spacing[1] + ' ' + spacing[2],
            fontSize: fontSizes.xs,
          },
          sizeLarge: {
            padding: spacing[2] + ' ' + spacing[5],
            fontSize: fontSizes.base,
          },
          contained: {
            boxShadow: shadows.xs,
            '&:hover': {
              boxShadow: shadows.md,
            },
          },
          outlined: {
            borderColor: mode === 'dark' ? colors.border.default : colors.border.light,
          },
          text: {
            '&:hover': {
              backgroundColor: colors.action.hover,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            width: iconButtonSizes.medium,
            height: iconButtonSizes.medium,
            padding: spacing[1],
            color: colors.text.secondary,
            '&:hover': {
              backgroundColor: colors.action.hover,
              color: colors.text.primary,
            },
          },
          sizeSmall: {
            width: iconButtonSizes.small,
            height: iconButtonSizes.small,
          },
          sizeLarge: {
            width: iconButtonSizes.large,
            height: iconButtonSizes.large,
          },
        },
      },
      MuiLoadingButton: {
        styleOverrides: {
          root: {
            minWidth: '100px',
          },
        },
      },
      // ============================================
      // CARD COMPONENTS
      // ============================================
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.lg,
            boxShadow: shadows.sm,
            border: '1px solid ' + colors.border.light,
            backgroundColor: colors.background.secondary,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: spacing[4],
            '&:last-child': {
              paddingBottom: spacing[4],
            },
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: spacing[4] + ' ' + spacing[4] + ' 0 ' + spacing[4],
          },
          title: {
            fontSize: fontSizes.lg,
            fontWeight: fontWeights.semibold,
          },
        },
      },
      // ============================================
      // PAPER COMPONENTS
      // ============================================
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
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
          elevation4: {
            boxShadow: shadows.xl,
          },
        },
      },
      // ============================================
      // DIALOG COMPONENTS
      // ============================================
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: borderRadius.xl,
            padding: spacing[4],
          },
          paperWidthSm: {
            maxWidth: '480px',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: fontSizes.xl,
            fontWeight: fontWeights.semibold,
            padding: spacing[2] + ' 0 ' + spacing[3] + ' 0',
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            paddingTop: spacing[3],
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: spacing[3] + ' 0 0 0',
            gap: spacing[2],
          },
        },
      },
      // ============================================
      // CHIP COMPONENTS
      // ============================================
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.full,
            fontSize: fontSizes.xs,
            fontWeight: fontWeights.medium,
          },
          filled: {
            backgroundColor: mode === 'dark' ? colors.neutral[700] : colors.neutral[100],
          },
          outlined: {
            borderColor: mode === 'dark' ? colors.border.default : colors.border.light,
          },
        },
      },
      // ============================================
      // TOOLTIP COMPONENTS
      // ============================================
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: borderRadius.sm,
            fontSize: fontSizes.sm,
            backgroundColor: colors.neutral[800],
            color: colors.neutral[0],
            padding: spacing[1] + ' ' + spacing[2],
          },
        },
      },
      // ============================================
      // ALERT COMPONENTS
      // ============================================
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.default,
            padding: spacing[2] + ' ' + spacing[3],
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
      // ============================================
      // TAB COMPONENTS
      // ============================================
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: fontWeights.medium,
            fontSize: fontSizes.sm,
            minWidth: 'auto',
            padding: spacing[2] + ' ' + spacing[3],
            minHeight: touchTargets.min,
            '&.Mui-selected': {
              color: colors.primary[600],
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: '2px',
            borderRadius: borderRadius.sm,
            backgroundColor: colors.primary[600],
          },
        },
      },
      // ============================================
      // LIST COMPONENTS
      // ============================================
      MuiList: {
        styleOverrides: {
          root: {
            padding: spacing[1],
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.default,
            margin: spacing[1] + ' ' + spacing[2],
            minHeight: touchTargets.min,
            '&.Mui-selected': {
              backgroundColor: colors.state.selected,
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: spacing[5],
            color: colors.text.tertiary,
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontSize: fontSizes.sm,
            fontWeight: fontWeights.normal,
          },
          secondary: {
            fontSize: fontSizes.xs,
            color: colors.text.tertiary,
          },
        },
      },
      // ============================================
      // MENU COMPONENTS
      // ============================================
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: borderRadius.lg,
            boxShadow: shadows.lg,
            border: '1px solid ' + colors.border.light,
            marginTop: spacing[1],
          },
        },
      },
      // ============================================
      // SKELETON COMPONENTS
      // ============================================
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? colors.neutral[700] : colors.neutral[200],
          },
        },
      },
      // ============================================
      // LINEAR PROGRESS
      // ============================================
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: borderRadius.full,
            height: '8px',
          },
          bar: {
            borderRadius: borderRadius.full,
          },
        },
      },
      // ============================================
      // SWITCH COMPONENTS
      // ============================================
      MuiSwitch: {
        styleOverrides: {
          root: {
            padding: spacing[1],
            width: 52,
            height: 32,
          },
          switchBase: {
            padding: spacing[1],
            '&.Mui-checked': {
              color: colors.primary[600],
              '& + .MuiSwitch-track': {
                backgroundColor: colors.primary[600],
                opacity: 0.5,
              },
            },
          },
          thumb: {
            width: 24,
            height: 24,
            boxShadow: shadows.xs,
          },
          track: {
            borderRadius: borderRadius.full,
            backgroundColor: mode === 'dark' ? colors.neutral[600] : colors.neutral[300],
            opacity: 1,
          },
        },
      },
      // ============================================
      // CHECKBOX COMPONENTS
      // ============================================
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
      // ============================================
      // RADIO COMPONENTS
      // ============================================
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
      // ============================================
      // APP BAR & DRAWER
      // ============================================
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
      // ============================================
      // TYPOGRAPHY COMPONENTS
      // ============================================
      MuiTypography: {
        styleOverrides: {
          h1: {
            fontWeight: fontWeights.bold,
            fontSize: fontSizes['4xl'],
            lineHeight: lineHeights.tight,
          },
          h2: {
            fontWeight: fontWeights.bold,
            fontSize: fontSizes['3xl'],
            lineHeight: lineHeights.tight,
          },
          h3: {
            fontWeight: fontWeights.semibold,
            fontSize: fontSizes['2xl'],
            lineHeight: lineHeights.tight,
          },
          h4: {
            fontWeight: fontWeights.semibold,
            fontSize: fontSizes.xl,
            lineHeight: lineHeights.normal,
          },
          h5: {
            fontWeight: fontWeights.semibold,
            fontSize: fontSizes.lg,
            lineHeight: lineHeights.normal,
          },
          h6: {
            fontWeight: fontWeights.semibold,
            fontSize: fontSizes.base,
            lineHeight: lineHeights.normal,
          },
          body1: {
            fontSize: fontSizes.base,
            lineHeight: lineHeights.relaxed,
          },
          body2: {
            fontSize: fontSizes.sm,
            lineHeight: lineHeights.relaxed,
          },
          caption: {
            fontSize: fontSizes.xs,
            lineHeight: lineHeights.normal,
            color: colors.text.tertiary,
          },
          button: {
            textTransform: 'none',
            fontWeight: fontWeights.medium,
          },
        },
      },
      // ============================================
      // BREADCRUMBS
      // ============================================
      MuiBreadcrumbs: {
        styleOverrides: {
          separator: {
            color: colors.text.tertiary,
            marginLeft: spacing[2],
            marginRight: spacing[2],
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: colors.text.link,
            textDecoration: 'none',
            '&:hover': {
              color: colors.text.linkHover,
              textDecoration: 'underline',
            },
          },
        },
      },
      // ============================================
      // DIVIDER
      // ============================================
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.border.light,
          },
        },
      },
      // ============================================
      // NAVIGATION RAIL
      // ============================================
      MuiDrawer: {
        styleOverrides: {
          root: {
            width: navigationRailSizes.expanded,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          },
          paper: {
            width: navigationRailSizes.expanded,
            borderRight: '1px solid ' + (mode === 'dark' ? navigationRailColors.dark.railBorder : navigationRailColors.light.railBorder),
            backgroundColor: mode === 'dark' ? navigationRailColors.dark.railBackground : navigationRailColors.light.railBackground,
            transition: transitions.normal,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            minHeight: navigationRailSizes.itemHeight,
            padding: spacing[2] + ' ' + spacing[3],
            borderRadius: borderRadius.default,
            margin: spacing[1] + ' ' + spacing[2],
            '&.Mui-selected': {
              backgroundColor: mode === 'dark' ? navigationRailColors.dark.itemActiveBg : navigationRailColors.light.itemActiveBg,
              color: mode === 'dark' ? navigationRailColors.dark.itemActiveText : navigationRailColors.light.itemActiveText,
              '& .MuiListItemIcon-root': {
                color: mode === 'dark' ? navigationRailColors.dark.itemActiveText : navigationRailColors.light.itemActiveText,
              },
              '&:hover': {
                backgroundColor: mode === 'dark' ? navigationRailColors.dark.itemActiveBg : navigationRailColors.light.itemActiveBg,
              },
            },
            '&:hover': {
              backgroundColor: mode === 'dark' ? navigationRailColors.dark.itemHoverBg : navigationRailColors.light.itemHoverBg,
            },
          },
          gutters: {
            paddingLeft: spacing[2],
            paddingRight: spacing[2],
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 'auto',
            color: mode === 'dark' ? navigationRailColors.dark.itemTextSecondary : navigationRailColors.light.itemTextSecondary,
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          navTitle: {
            fontSize: fontSizes.xs,
            fontWeight: fontWeights.semibold,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: mode === 'dark' ? navigationRailColors.dark.itemTextSecondary : navigationRailColors.light.itemTextSecondary,
          },
          navItem: {
            fontSize: fontSizes.sm,
            fontWeight: fontWeights.medium,
            color: mode === 'dark' ? navigationRailColors.dark.itemText : navigationRailColors.light.itemText,
          },
        },
      },
    },
    },
  );
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
