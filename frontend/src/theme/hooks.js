/**
 * Theme Hooks & Utilities
 * 
 * Convenient hooks and utilities for working with the theme system.
 * All components should use these instead of accessing theme values directly.
 */

import { useTheme } from './ThemeProvider';
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
  transitions,
  iconSizes,
  breakpoints,
  accessibility,
  zIndex,
  keyframes,
} from './tokens';

// ============================================================================
// COLOR HOOKS
// ============================================================================

/**
 * useColors - Get the current color palette
 * 
 * @returns {Object} Color palette for the current theme mode
 * 
 * @example
 * const colors = useColors();
 * <div style={{ color: colors.text.primary }} />
 */
export function useColors() {
  const { colors } = useTheme();
  return colors;
}

/**
 * useColor - Get a specific color from the palette
 * 
 * @param {string} colorName - Name of the color (primary, secondary, success, etc.)
 * @param {string} shade - Shade level (50-900, or main, light, dark)
 * @returns {string} Color value
 * 
 * @example
 * const primaryColor = useColor('primary', 600);
 * const successMain = useColor('success', 'main');
 */
export function useColor(colorName, shade = 600) {
  const colors = useColors();
  
  if (!colors[colorName]) {
    console.warn(`Color "${colorName}" not found in theme palette`);
    return colors.neutral[500];
  }
  
  return colors[colorName][shade] || colors[colorName].main || colors[colorName][600];
}

/**
 * useBackgroundColor - Get background color based on context
 * 
 * @param {string} context - 'primary', 'secondary', 'tertiary', 'inverse'
 * @returns {string} Background color value
 * 
 * @example
 * const bgColor = useBackgroundColor('secondary');
 */
export function useBackgroundColor(context = 'primary') {
  const colors = useColors();
  return colors.background[context] || colors.background.primary;
}

/**
 * useTextColor - Get text color based on context
 * 
 * @param {string} context - 'primary', 'secondary', 'tertiary', 'disabled', 'inverse'
 * @returns {string} Text color value
 * 
 * @example
 * const textColor = useTextColor('secondary');
 */
export function useTextColor(context = 'primary') {
  const colors = useColors();
  return colors.text[context] || colors.text.primary;
}

/**
 * useBorderColor - Get border color based on context
 * 
 * @param {string} context - 'light', 'default', 'strong'
 * @returns {string} Border color value
 * 
 * @example
 * const borderColor = useBorderColor('default');
 */
export function useBorderColor(context = 'default') {
  const colors = useColors();
  return colors.border[context] || colors.border.default;
}

// ============================================================================
// TYPOGRAPHY HOOKS
// ============================================================================

/**
 * useFontFamily - Get the current font family
 * 
 * @param {string} type - 'primary' or 'mono'
 * @returns {string} Font family value
 * 
 * @example
 * const fontFamily = useFontFamily('primary');
 */
export function useFontFamily(type = 'primary') {
  const { fontFamily } = useTheme();
  return fontFamily[type] || fontFamily.primary;
}

/**
 * useFontSize - Get a specific font size
 * 
 * @param {string} size - Size key (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl)
 * @returns {string} Font size value
 * 
 * @example
 * const fontSize = useFontSize('lg');
 */
export function useFontSize(size) {
  return fontSizes[size] || fontSizes.base;
}

/**
 * useFontWeight - Get a specific font weight
 * 
 * @param {string} weight - Weight key (light, normal, medium, semibold, bold)
 * @returns {number} Font weight value
 * 
 * @example
 * const fontWeight = useFontWeight('semibold');
 */
export function useFontWeight(weight) {
  return fontWeights[weight] || fontWeights.normal;
}

/**
 * useLineHeight - Get a specific line height
 * 
 * @param {string} height - Height key (tight, normal, relaxed, loose)
 * @returns {string|number} Line height value
 * 
 * @example
 * const lineHeight = useLineHeight('relaxed');
 */
export function useLineHeight(height) {
  return lineHeights[height] || lineHeights.normal;
}

// ============================================================================
// LAYOUT HOOKS
// ============================================================================

/**
 * useSpacing - Get a specific spacing value
 * 
 * @param {number|string} factor - Spacing factor (0-24) or key
 * @returns {string} Spacing value
 * 
 * @example
 * const padding = useSpacing(4);
 * const margin = useSpacing('4');
 */
export function useSpacing(factor) {
  return spacing[factor] || `${factor * 0.25}rem`;
}

/**
 * useBorderRadius - Get a specific border radius
 * 
 * @param {string} radius - Radius key (none, sm, default, md, lg, xl, full)
 * @returns {string} Border radius value
 * 
 * @example
 * const borderRadius = useBorderRadius('lg');
 */
export function useBorderRadius(radius = 'default') {
  return borderRadius[radius] || borderRadius.default;
}

/**
 * useShadow - Get a specific shadow
 * 
 * @param {string} elevation - Shadow key (none, xs, sm, md, lg, xl, 2xl, focus)
 * @returns {string} Shadow value
 * 
 * @example
 * const shadow = useShadow('lg');
 */
export function useShadow(elevation = 'md') {
  return shadows[elevation] || shadows.md;
}

/**
 * useIconSize - Get a specific icon size
 * 
 * @param {string} size - Size key (xs, sm, md, lg, xl)
 * @returns {string} Icon size value
 * 
 * @example
 * const iconSize = useIconSize('md');
 */
export function useIconSize(size = 'md') {
  return iconSizes[size] || iconSizes.md;
}

// ============================================================================
// TRANSITION HOOKS
// ============================================================================

/**
 * useTransition - Get a specific transition
 * 
 * @param {string} speed - Transition speed (fast, normal, slow, spring)
 * @returns {string} Transition value
 * 
 * @example
 * const transition = useTransition('normal');
 */
export function useTransition(speed = 'normal') {
  return transitions[speed] || transitions.normal;
}

/**
 * useAnimation - Get a specific animation
 * 
 * @param {string} name - Animation name (fadeIn, fadeOut, slideIn, etc.)
 * @returns {string} Animation value
 * 
 * @example
 * const animation = useAnimation('fadeIn');
 */
export function useAnimation(name) {
  return animations[name] || animations.fadeIn;
}

// ============================================================================
// MODE HOOKS
// ============================================================================

/**
 * useThemeMode - Get current theme mode information
 * 
 * @returns {Object} Theme mode state and utilities
 * 
 * @example
 * const { mode, resolvedMode, setThemeMode, toggleThemeMode } = useThemeMode();
 */
export function useThemeMode() {
  const { mode, resolvedMode, setThemeMode, toggleThemeMode, availableModes } = useTheme();
  
  return {
    mode,
    resolvedMode,
    setThemeMode,
    toggleThemeMode,
    availableModes,
    isDark: resolvedMode === 'dark',
    isLight: resolvedMode === 'light',
    isSystem: mode === 'system',
  };
}

/**
 * useIsDarkMode - Quick check if dark mode is active
 * 
 * @returns {boolean} True if dark mode is active
 * 
 * @example
 * if (isDarkMode) { ... }
 */
export function useIsDarkMode() {
  const { resolvedMode } = useTheme();
  return resolvedMode === 'dark';
}

// ============================================================================
// DIRECTION HOOKS
// ============================================================================

/**
 * useDirection - Get current direction information
 * 
 * @returns {Object} Direction state and utilities
 * 
 * @example
 * const { direction, isRTL, locale } = useDirection();
 */
export function useDirection() {
  const { locale, setAppLocale, direction, isRTL, availableLocales } = useTheme();
  
  return {
    locale,
    setAppLocale,
    direction,
    isRTL,
    isLTR: !isRTL,
    availableLocales,
  };
}

// ============================================================================
// ACCESSIBILITY HOOKS
// ============================================================================

/**
 * useAccessibility - Get accessibility settings
 * 
 * @returns {Object} Accessibility preferences
 * 
 * @example
 * const { reducedMotion, highContrast, setReducedMotion } = useAccessibility();
 */
export function useAccessibility() {
  const { 
    preferences, 
    setReducedMotion, 
    setHighContrast, 
    setFontScale 
  } = useTheme();
  
  return {
    ...preferences,
    setReducedMotion,
    setHighContrast,
    setFontScale,
  };
}

/**
 * useFocusRing - Get focus ring styles
 * 
 * @param {boolean} inset - Use inset focus ring
 * @returns {Object} Focus ring styles
 * 
 * @example
 * const focusRing = useFocusRing();
 */
export function useFocusRing(inset = false) {
  const { resolvedMode } = useTheme();
  const { reducedMotion } = useAccessibility();
  
  if (reducedMotion) {
    return {
      outline: `2px solid ${resolvedMode === 'dark' ? colorsDark.border.focus : colorsLight.border.focus}`,
      outlineOffset: '2px',
    };
  }
  
  if (inset) {
    return {
      boxShadow: `inset 0 0 0 2px ${resolvedMode === 'dark' ? colorsDark.border.focus : colorsLight.border.focus}`,
    };
  }
  
  return {
    boxShadow: resolvedMode === 'dark' 
      ? accessibility.focusRing.dark 
      : accessibility.focusRing.light,
  };
}

// ============================================================================
// STYLED OBJECT CREATORS
// ============================================================================

/**
 * createTextStyles - Create text style object
 * 
 * @param {Object} options - Text style options
 * @returns {Object} Style object
 * 
 * @example
 * const headingStyle = createTextStyles({
 *   size: 'xl',
 *   weight: 'bold',
 *   color: 'primary',
 * });
 */
export function createTextStyles({ size = 'base', weight = 'normal', color = 'primary', lineHeight = 'normal' } = {}) {
  return {
    fontSize: useFontSize(size),
    fontWeight: useFontWeight(weight),
    lineHeight: useLineHeight(lineHeight),
    color: useTextColor(color),
    fontFamily: useFontFamily('primary'),
  };
}

/**
 * createButtonStyles - Create button style object
 * 
 * @param {Object} options - Button style options
 * @returns {Object} Style object
 * 
 * @example
 * const buttonStyle = createButtonStyles({ variant: 'primary', size: 'md' });
 */
export function createButtonStyles({ variant = 'primary', size = 'md', fullWidth = false } = {}) {
  const colors = useColors();
  const borderRadius = useBorderRadius('default');
  
  const colorMap = {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };
  
  const colorShades = colorMap[variant] || colorMap.primary;
  
  const paddingMap = {
    sm: `${useSpacing(1)} ${useSpacing(2)}`,
    md: `${useSpacing(2)} ${useSpacing(4)}`,
    lg: `${useSpacing(3)} ${useSpacing(6)}`,
  };
  
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: paddingMap[size] || paddingMap.md,
    fontSize: useFontSize('sm'),
    fontWeight: useFontWeight('medium'),
    borderRadius,
    border: 'none',
    cursor: 'pointer',
    transition: useTransition('fast'),
    backgroundColor: colorShades.main,
    color: colorShades.contrastText,
    width: fullWidth ? '100%' : 'auto',
    '&:hover': {
      backgroundColor: colorShades.dark,
    },
    '&:active': {
      backgroundColor: colorShades[700],
    },
    '&:focus': {
      outline: 'none',
      boxShadow: useShadow('focus'),
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };
}

/**
 * createCardStyles - Create card style object
 * 
 * @param {Object} options - Card style options
 * @returns {Object} Style object
 * 
 * @example
 * const cardStyle = createCardStyles({ elevated: true });
 */
export function createCardStyles({ elevated = false, interactive = false } = {}) {
  return {
    backgroundColor: useBackgroundColor('secondary'),
    borderRadius: useBorderRadius('lg'),
    boxShadow: elevated ? useShadow('lg') : useShadow('sm'),
    border: `1px solid ${useBorderColor('light')}`,
    transition: useTransition('normal'),
    ...(interactive && {
      cursor: 'pointer',
      '&:hover': {
        boxShadow: useShadow('xl'),
        transform: 'translateY(-2px)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
    }),
  };
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export {
  colorsLight,
  colorsDark,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  spacing,
  borderRadius,
  shadows,
  transitions,
  iconSizes,
  breakpoints,
  accessibility,
  zIndex,
  keyframes,
};
