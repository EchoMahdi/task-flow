/**
 * Theme Tokens Definition
 * 
 * Central source of truth for all visual design tokens.
 * Uses semantic naming (e.g., 'primary', 'surface') instead of raw colors.
 * Supports light/dark modes with automatic mode switching.
 */

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

export const fonts = {
  // Primary sans-serif for English
  en: {
    primary: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
  },
  // Vazir font for Persian (RTL)
  fa: {
    primary: '"Vazir", "Vazirmatn", "Tahoma", "Arial", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
  },
};

// Font sizes using rem units for accessibility
export const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
};

// Font weights
export const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

// Line heights
export const lineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
};

// ============================================================================
// COLOR TOKENS - LIGHT MODE
// ============================================================================

export const colorsLight = {
  // Brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',  // Main primary
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    contrastText: '#ffffff',
  },
  
  secondary: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',  // Main secondary
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    contrastText: '#ffffff',
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    contrastText: '#ffffff',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    contrastText: '#18181b',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    contrastText: '#ffffff',
  },
  
  info: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',  // Main info
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    contrastText: '#ffffff',
  },
  
  // Neutral colors
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    1000: '#000000',
  },
  
  // Background colors
  background: {
    primary: '#fafafa',      // Main page background
    secondary: '#ffffff',    // Surface backgrounds (cards, modals)
    tertiary: '#f4f4f5',     // Subtle backgrounds (hover states)
    inverse: '#18181b',      // Dark backgrounds
  },
  
  // Surface colors
  surface: {
    default: '#ffffff',
    elevated: '#ffffff',
    raised: '#ffffff',
    overlay: 'rgba(24, 24, 27, 0.5)',      // Modal overlays
    backdrop: 'rgba(24, 24, 27, 0.3)',    // Backdrop blur
  },
  
  // Text colors
  text: {
    primary: '#18181b',           // Primary text
    secondary: '#52525b',         // Secondary text
    tertiary: '#71717a',          // Tertiary/muted text
    disabled: '#a1a1aa',          // Disabled text
    inverse: '#ffffff',           // Text on dark backgrounds
    link: '#2563eb',              // Link color
    linkHover: '#1d4ed8',         // Link hover color
  },
  
  // Border colors
  border: {
    light: '#e4e4e7',             // Subtle borders
    default: '#d4d4d8',           // Default borders
    strong: '#a1a1aa',            // Strong borders
    inverse: '#3f3f46',           // Borders on dark backgrounds
    focus: '#2563eb',             // Focus ring color
  },
  
  // State colors
  state: {
    hover: 'rgba(0, 0, 0, 0.04)',
    focus: 'rgba(37, 99, 235, 0.12)',
    selected: 'rgba(37, 99, 235, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
  },
  
  // Action colors (for interactive elements like buttons, dropdowns)
  action: {
    hover: 'rgba(0, 0, 0, 0.04)',
    active: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
  },
};

// ============================================================================
// COLOR TOKENS - DARK MODE
// ============================================================================

export const colorsDark = {
  // Brand colors - slightly adjusted for dark mode
  primary: {
    50: '#1e3a8a',
    100: '#1e40af',
    200: '#1d4ed8',
    300: '#2563eb',
    400: '#3b82f6',
    500: '#60a5fa',
    600: '#93c5fd',
    700: '#bfdbfe',
    800: '#dbeafe',
    900: '#eff6ff',
    contrastText: '#18181b',
  },
  
  secondary: {
    50: '#18181b',
    100: '#27272a',
    200: '#3f3f46',
    300: '#52525b',
    400: '#71717a',
    500: '#a1a1aa',
    600: '#d4d4d8',
    700: '#e4e4e7',
    800: '#f4f4f5',
    900: '#fafafa',
    contrastText: '#ffffff',
  },
  
  // Semantic colors - adjusted for dark backgrounds
  success: {
    50: '#14532d',
    100: '#166534',
    200: '#15803d',
    300: '#16a34a',
    400: '#22c55e',
    500: '#4ade80',
    600: '#86efac',
    700: '#bbf7d0',
    800: '#dcfce7',
    900: '#f0fdf4',
    contrastText: '#18181b',
  },
  
  warning: {
    50: '#78350f',
    100: '#92400e',
    200: '#b45309',
    300: '#d97706',
    400: '#f59e0b',
    500: '#fbbf24',
    600: '#fcd34d',
    700: '#fde68a',
    800: '#fef3c7',
    900: '#fffbeb',
    contrastText: '#18181b',
  },
  
  error: {
    50: '#7f1d1d',
    100: '#991b1b',
    200: '#b91c1c',
    300: '#dc2626',
    400: '#ef4444',
    500: '#f87171',
    600: '#fca5a5',
    700: '#fecaca',
    800: '#fee2e2',
    900: '#fef2f2',
    contrastText: '#ffffff',
  },
  
  info: {
    50: '#164e63',
    100: '#155e75',
    200: '#0e7490',
    300: '#0891b2',
    400: '#06b6d4',
    500: '#22d3ee',
    600: '#67e8f9',
    700: '#a5f3fc',
    800: '#cffafe',
    900: '#ecfeff',
    contrastText: '#18181b',
  },
  
  // Neutral colors
  neutral: {
    0: '#000000',
    50: '#09090b',
    100: '#18181b',
    200: '#27272a',
    300: '#3f3f46',
    400: '#52525b',
    500: '#71717a',
    600: '#a1a1aa',
    700: '#d4d4d8',
    800: '#e4e4e7',
    900: '#f4f4f5',
    1000: '#ffffff',
  },
  
  // Background colors
  background: {
    primary: '#09090b',      // Main page background
    secondary: '#18181b',    // Surface backgrounds
    tertiary: '#27272a',      // Subtle backgrounds
    inverse: '#fafafa',       // Light backgrounds
  },
  
  // Surface colors
  surface: {
    default: '#18181b',
    elevated: '#27272a',
    raised: '#3f3f46',
    overlay: 'rgba(0, 0, 0, 0.7)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Text colors
  text: {
    primary: '#f4f4f5',
    secondary: '#a1a1aa',
    tertiary: '#71717a',
    disabled: '#52525b',
    inverse: '#18181b',
    link: '#60a5fa',
    linkHover: '#93c5fd',
  },
  
  // Border colors
  border: {
    light: '#27272a',
    default: '#3f3f46',
    strong: '#52525b',
    inverse: '#e4e4e7',
    focus: '#60a5fa',
  },
  
  // State colors - adjusted for dark mode
  state: {
    hover: 'rgba(255, 255, 255, 0.04)',
    focus: 'rgba(96, 165, 250, 0.24)',
    selected: 'rgba(96, 165, 250, 0.16)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },
  
  // Action colors - adjusted for dark mode
  action: {
    hover: 'rgba(255, 255, 255, 0.04)',
    active: 'rgba(255, 255, 255, 0.08)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },
};

// ============================================================================
// SPACING & LAYOUT TOKENS
// ============================================================================

// Spacing scale (8px grid base)
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

// Border radius tokens
export const borderRadius = {
  none: '0',
  sm: '0.25rem',      // 4px
  default: '0.5rem',  // 8px
  md: '0.75rem',      // 12px
  lg: '1rem',         // 16px
  xl: '1.5rem',       // 24px
  full: '9999px',     // Circle/pill
};

// Icon sizes
export const iconSizes = {
  xs: '1rem',     // 16px
  sm: '1.25rem',  // 20px
  md: '1.5rem',   // 24px
  lg: '2rem',     // 32px
  xl: '2.5rem',   // 40px
};

// ============================================================================
// ELEVATION & SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  focus: '0 0 0 3px rgba(37, 99, 235, 0.4)',
  focusDark: '0 0 0 3px rgba(96, 165, 250, 0.4)',
};

// ============================================================================
// TRANSITION & MOTION
// ============================================================================

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};

export const animations = {
  fadeIn: 'fadeIn 200ms ease-in-out',
  fadeOut: 'fadeOut 200ms ease-in-out',
  slideIn: 'slideIn 300ms ease-in-out',
  slideOut: 'slideOut 300ms ease-in-out',
  scaleIn: 'scaleIn 200ms ease-in-out',
  scaleOut: 'scaleOut 200ms ease-in-out',
};

// Keyframes
export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideIn: {
    from: { transform: 'translateY(-10px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideOut: {
    from: { transform: 'translateY(0)', opacity: 1 },
    to: { transform: 'translateY(-10px)', opacity: 0 },
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  scaleOut: {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.95)', opacity: 0 },
  },
};

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1700,
  loading: 1800,
};

// ============================================================================
// SEARCH & INPUT TOKENS
// ============================================================================

export const searchColors = {
  light: {
    background: '#f3f4f6',
    border: '#e5e7eb',
    placeholder: '#9ca3af',
    text: '#111827',
    icon: '#6b7280',
    focus: '#3b82f6',
    focusRing: 'rgba(59, 130, 246, 0.15)',
  },
  dark: {
    background: '#27272a',
    border: '#3f3f46',
    placeholder: '#71717a',
    text: '#f4f4f5',
    icon: '#a1a1aa',
    focus: '#60a5fa',
    focusRing: 'rgba(96, 165, 250, 0.15)',
  },
};

export const inputColors = {
  light: {
    background: '#ffffff',
    border: '#d4d4d8',
    borderHover: '#a1a1aa',
    text: '#18181b',
    placeholder: '#71717a',
    disabledBackground: '#f4f4f5',
    disabledText: '#a1a1aa',
  },
  dark: {
    background: '#18181b',
    border: '#3f3f46',
    borderHover: '#52525b',
    text: '#f4f4f5',
    placeholder: '#71717a',
    disabledBackground: '#27272a',
    disabledText: '#52525b',
  },
};

// ============================================================================
// ELEMENT SIZE TOKENS
// ============================================================================

export const inputHeights = {
  small: '36px',
  medium: '44px',
  large: '52px',
};

export const iconButtonSizes = {
  small: '32px',
  medium: '40px',
  large: '48px',
};

export const touchTargets = {
  minimum: '44px',
  comfortable: '48px',
};

// ============================================================================
// COMPONENT TOKEN PRESETS
// ============================================================================

export const componentTokens = {
  // Button presets
  button: {
    padding: {
      small: '6px 12px',
      medium: '8px 16px',
      large: '10px 20px',
    },
    fontSize: {
      small: '0.8125rem',
      medium: '0.875rem',
      large: '0.9375rem',
    },
    iconSize: {
      small: '18px',
      medium: '20px',
      large: '22px',
    },
  },
  // Input presets
  input: {
    padding: {
      small: '8px 12px',
      medium: '10px 14px',
      large: '12px 16px',
    },
    borderRadius: '8px',
  },
  // Card presets
  card: {
    borderRadius: '12px',
    padding: '24px',
  },
  // Dialog presets
  dialog: {
    borderRadius: '16px',
    padding: '24px',
  },
  // Dropdown presets
  dropdown: {
    borderRadius: '8px',
    minWidth: '180px',
    padding: '8px',
  },
  // Badge presets
  badge: {
    borderRadius: '9999px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
};

// ============================================================================
// NAVIGATION RAIL TOKENS
// ============================================================================

export const navigationRailColors = {
  light: {
    railBackground: '#ffffff',
    railBorder: '#e4e4e7',
    itemActiveBg: '#eff6ff',
    itemActiveText: '#3b82f6',
    itemHoverBg: '#f4f4f5',
    itemText: '#18181b',
    itemTextSecondary: '#52525b',
    sectionBorder: '#e4e4e7',
    favoriteActive: '#f59e0b',
    badgeBg: '#3b82f6',
    badgeText: '#ffffff',
  },
  dark: {
    railBackground: '#18181b',
    railBorder: '#3f3f46',
    itemActiveBg: 'rgba(96, 165, 250, 0.15)',
    itemActiveText: '#60a5fa',
    itemHoverBg: '#27272a',
    itemText: '#f4f4f5',
    itemTextSecondary: '#a1a1aa',
    sectionBorder: '#3f3f46',
    favoriteActive: '#fbbf24',
    badgeBg: '#60a5fa',
    badgeText: '#18181b',
  },
};

export const navigationRailSizes = {
  collapsed: '72px',
  expanded: '260px',
  itemHeight: '40px',
  iconSize: '20px',
  sectionIconSize: '18px',
  avatarSize: '40px',
  badgeMinWidth: '20px',
  badgeHeight: '20px',
  badgeFontSize: '12px',
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: '0rem',      // 0px
  sm: '40rem',     // 640px
  md: '48rem',     // 768px
  lg: '64rem',     // 1024px
  xl: '80rem',     // 1280px
  '2xl': '96rem',  // 1536px
};

// ============================================================================
// ACCESSIBILITY TOKENS
// ============================================================================

export const accessibility = {
  // Focus ring - always visible for keyboard navigation
  focusRing: {
    light: '0 0 0 3px rgba(37, 99, 235, 0.4)',
    dark: '0 0 0 3px rgba(96, 165, 250, 0.4)',
    inset: 'inset 0 0 0 2px rgba(37, 99, 235, 0.4)',
  },
  
  // Minimum touch target size (44x44px minimum per WCAG)
  touchTarget: {
    min: '2.75rem',  // 44px
    optimal: '3rem',  // 48px
  },
  
  // Reduced motion preferences
  reducedMotion: {
    fast: '100ms',
    normal: '150ms',
    slow: '200ms',
    none: '0ms',
  },
  
  // Screen reader only
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  },
};

// ============================================================================
// RTL/LTR DIRECTION TOKENS
// ============================================================================

export const direction = {
  ltr: 'ltr',
  rtl: 'rtl',
};

export const mirroredTransforms = {
  horizontal: {
    scaleX: -1,
  },
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

/**
 * Get the appropriate color palette based on mode
 */
export function getColors(mode = 'light') {
  return mode === 'dark' ? colorsDark : colorsLight;
}

/**
 * Get the appropriate font family based on locale
 */
export function getFontFamily(locale = 'en') {
  return fonts[locale] || fonts.en;
}

/**
 * Get CSS custom property name for theme tokens
 */
export function getCSSVar(name) {
  return `--theme-${name}`;
}

/**
 * Create CSS custom properties object
 */
export function createCSSVariables(mode = 'light', locale = 'en') {
  const colors = getColors(mode);
  const fontFamily = getFontFamily(locale);
  const search = mode === 'dark' ? searchColors.dark : searchColors.light;
  const input = mode === 'dark' ? inputColors.dark : inputColors.light;
  
  return {
    // ============================================
    // CORE COLORS
    // ============================================
    // Primary colors
    '--theme-color-primary-main': colors.primary[600],
    '--theme-color-primary-light': colors.primary[400],
    '--theme-color-primary-dark': colors.primary[700],
    '--theme-color-primary-50': colors.primary[50],
    '--theme-color-primary-100': colors.primary[100],
    // Secondary colors
    '--theme-color-secondary-main': colors.secondary[500],
    // Semantic colors
    '--theme-color-success-main': colors.success[500],
    '--theme-color-warning-main': colors.warning[500],
    '--theme-color-error-main': colors.error[500],
    '--theme-color-info-main': colors.info[500],
    
    // ============================================
    // BACKGROUND COLORS
    // ============================================
    '--theme-color-background-primary': colors.background.primary,
    '--theme-color-background-secondary': colors.background.secondary,
    '--theme-color-background-tertiary': colors.background.tertiary,
    '--theme-color-background-inverse': colors.background.inverse,
    
    // ============================================
    // TEXT COLORS
    // ============================================
    '--theme-color-text-primary': colors.text.primary,
    '--theme-color-text-secondary': colors.text.secondary,
    '--theme-color-text-tertiary': colors.text.tertiary,
    '--theme-color-text-disabled': colors.text.disabled,
    '--theme-color-text-inverse': colors.text.inverse,
    '--theme-color-text-link': colors.text.link,
    '--theme-color-text-link-hover': colors.text.linkHover,
    
    // ============================================
    // BORDER COLORS
    // ============================================
    '--theme-color-border-light': colors.border.light,
    '--theme-color-border-default': colors.border.default,
    '--theme-color-border-strong': colors.border.strong,
    '--theme-color-border-inverse': colors.border.inverse,
    '--theme-color-border-focus': colors.border.focus,
    
    // ============================================
    // SURFACE COLORS
    // ============================================
    '--theme-color-surface-default': colors.surface.default,
    '--theme-color-surface-elevated': colors.surface.elevated,
    '--theme-color-surface-raised': colors.surface.raised,
    '--theme-color-surface-overlay': colors.surface.overlay,
    '--theme-color-surface-backdrop': colors.surface.backdrop,
    
    // ============================================
    // STATE COLORS
    // ============================================
    '--theme-color-state-hover': colors.state.hover,
    '--theme-color-state-focus': colors.state.focus,
    '--theme-color-state-selected': colors.state.selected,
    '--theme-color-state-disabled': colors.state.disabled,
    '--theme-color-state-disabled-background': colors.state.disabledBackground,
    
    // ============================================
    // ACTION COLORS
    // ============================================
    '--theme-color-action-hover': colors.action.hover,
    '--theme-color-action-active': colors.action.active,
    '--theme-color-action-disabled': colors.action.disabled,
    '--theme-color-action-disabled-background': colors.action.disabledBackground,
    
    // ============================================
    // SEARCH COLORS
    // ============================================
    '--theme-color-search-background': search.background,
    '--theme-color-search-border': search.border,
    '--theme-color-search-placeholder': search.placeholder,
    '--theme-color-search-text': search.text,
    '--theme-color-search-icon': search.icon,
    '--theme-color-search-focus': search.focus,
    '--theme-color-search-focus-ring': search.focusRing,
    
    // ============================================
    // INPUT COLORS
    // ============================================
    '--theme-color-input-background': input.background,
    '--theme-color-input-border': input.border,
    '--theme-color-input-border-hover': input.borderHover,
    '--theme-color-input-text': input.text,
    '--theme-color-input-placeholder': input.placeholder,
    '--theme-color-input-disabled-background': input.disabledBackground,
    '--theme-color-input-disabled-text': input.disabledText,
    
    // ============================================
    // TYPOGRAPHY
    // ============================================
    '--theme-font-family-primary': fontFamily.primary,
    '--theme-font-family-mono': fontFamily.mono,
    '--theme-font-size-xs': fontSizes.xs,
    '--theme-font-size-sm': fontSizes.sm,
    '--theme-font-size-base': fontSizes.base,
    '--theme-font-size-lg': fontSizes.lg,
    '--theme-font-size-xl': fontSizes.xl,
    '--theme-font-weight-normal': fontWeights.normal,
    '--theme-font-weight-medium': fontWeights.medium,
    '--theme-font-weight-semibold': fontWeights.semibold,
    '--theme-font-weight-bold': fontWeights.bold,
    
    // ============================================
    // SPACING
    // ============================================
    '--theme-spacing-unit': '0.25rem',
    '--theme-spacing-xs': spacing[1],
    '--theme-spacing-sm': spacing[2],
    '--theme-spacing-md': spacing[3],
    '--theme-spacing-lg': spacing[4],
    '--theme-spacing-xl': spacing[5],
    '--theme-spacing-2xl': spacing[6],
    
    // ============================================
    // BORDER RADIUS
    // ============================================
    '--theme-border-radius-none': borderRadius.none,
    '--theme-border-radius-sm': borderRadius.sm,
    '--theme-border-radius-default': borderRadius.default,
    '--theme-border-radius-md': borderRadius.md,
    '--theme-border-radius-lg': borderRadius.lg,
    '--theme-border-radius-xl': borderRadius.xl,
    '--theme-border-radius-full': borderRadius.full,
    
    // ============================================
    // SHADOWS
    // ============================================
    '--theme-shadow-none': shadows.none,
    '--theme-shadow-xs': shadows.xs,
    '--theme-shadow-sm': shadows.sm,
    '--theme-shadow-md': shadows.md,
    '--theme-shadow-lg': shadows.lg,
    '--theme-shadow-xl': shadows.xl,
    '--theme-shadow-focus': shadows.focus,
    '--theme-shadow-focus-dark': shadows.focusDark,
    
    // ============================================
    // TRANSITIONS
    // ============================================
    '--theme-transition-fast': transitions.fast,
    '--theme-transition-normal': transitions.normal,
    '--theme-transition-slow': transitions.slow,
    
    // ============================================
    // DIRECTION
    // ============================================
    '--theme-direction': locale === 'fa' ? 'rtl' : 'ltr',
    '--theme-text-align': locale === 'fa' ? 'right' : 'left',
    
    // ============================================
    // NAVIGATION RAIL COLORS
    // ============================================
    '--theme-nav-rail-background': mode === 'dark' ? navigationRailColors.dark.railBackground : navigationRailColors.light.railBackground,
    '--theme-nav-rail-border': mode === 'dark' ? navigationRailColors.dark.railBorder : navigationRailColors.light.railBorder,
    '--theme-nav-item-active-bg': mode === 'dark' ? navigationRailColors.dark.itemActiveBg : navigationRailColors.light.itemActiveBg,
    '--theme-nav-item-active-text': mode === 'dark' ? navigationRailColors.dark.itemActiveText : navigationRailColors.light.itemActiveText,
    '--theme-nav-item-hover-bg': mode === 'dark' ? navigationRailColors.dark.itemHoverBg : navigationRailColors.light.itemHoverBg,
    '--theme-nav-item-text': mode === 'dark' ? navigationRailColors.dark.itemText : navigationRailColors.light.itemText,
    '--theme-nav-item-text-secondary': mode === 'dark' ? navigationRailColors.dark.itemTextSecondary : navigationRailColors.light.itemTextSecondary,
    '--theme-nav-section-border': mode === 'dark' ? navigationRailColors.dark.sectionBorder : navigationRailColors.light.sectionBorder,
    '--theme-nav-favorite-active': mode === 'dark' ? navigationRailColors.dark.favoriteActive : navigationRailColors.light.favoriteActive,
    '--theme-nav-badge-bg': mode === 'dark' ? navigationRailColors.dark.badgeBg : navigationRailColors.light.badgeBg,
    '--theme-nav-badge-text': mode === 'dark' ? navigationRailColors.dark.badgeText : navigationRailColors.light.badgeText,
    
    // ============================================
    // NAVIGATION RAIL SIZES
    // ============================================
    '--theme-nav-rail-collapsed-width': navigationRailSizes.collapsed,
    '--theme-nav-rail-expanded-width': navigationRailSizes.expanded,
    '--theme-nav-item-height': navigationRailSizes.itemHeight,
    '--theme-nav-icon-size': navigationRailSizes.iconSize,
    '--theme-nav-section-icon-size': navigationRailSizes.sectionIconSize,
    '--theme-nav-avatar-size': navigationRailSizes.avatarSize,
    '--theme-nav-badge-min-width': navigationRailSizes.badgeMinWidth,
    '--theme-nav-badge-height': navigationRailSizes.badgeHeight,
    '--theme-nav-badge-font-size': navigationRailSizes.badgeFontSize,
  };
}
