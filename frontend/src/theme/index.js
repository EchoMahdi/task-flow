/**
 * Theme Manager - Main Export
 * 
 * Centralized theming system for the TaskFlow application.
 * All components should import from this module.
 */

// Provider & Hook
export { ThemeProvider, useTheme, withTheme, ThemeConsumer } from './ThemeProvider';

// Hooks & Utilities
export * from './hooks';

// Tokens
export * from './tokens';

// Components
export { ThemeSwitcher, ThemeIndicator, ThemeListener } from './components/ThemeSwitcher';

// MUI Integration
export { MUIThemeProvider, useMUIThemeFromManager, createMUITheme } from './MUIThemeProvider';

// ============================================================================
// QUICK REFERENCE
// ============================================================================

/**
 * Import examples:
 * 
 * // Using the main hook
 * import { useTheme, useColors, useFontFamily } from './theme';
 * 
 * // Using theme modes
 * import { useThemeMode, useIsDarkMode } from './theme';
 * 
 * // Using direction/locale
 * import { useDirection } from './theme';
 * 
 * // Using accessibility
 * import { useAccessibility, useFocusRing } from './theme';
 * 
 * // Using styled utilities
 * import { createTextStyles, createButtonStyles, createCardStyles } from './theme';
 */

// ============================================================================
// THEME TOKENS REFERENCE
// ============================================================================

/**
 * Available tokens:
 * 
 * Colors:
 * - colors.primary[50-900], colors.primary.main, colors.primary.contrastText
 * - colors.secondary[50-900], colors.secondary.main
 * - colors.success[50-900], colors.success.main
 * - colors.warning[50-900], colors.warning.main
 * - colors.error[50-900], colors.error.main
 * - colors.background.primary, colors.background.secondary
 * - colors.text.primary, colors.text.secondary, colors.text.muted
 * - colors.border.light, colors.border.default, colors.border.strong
 * 
 * Fonts:
 * - fonts.en.primary, fonts.en.mono
 * - fonts.fa.primary, fonts.fa.mono
 * 
 * Spacing:
 * - spacing[0-24] (0 to 6rem)
 * 
 * Border Radius:
 * - borderRadius.none, borderRadius.sm, borderRadius.default
 * - borderRadius.md, borderRadius.lg, borderRadius.xl, borderRadius.full
 * 
 * Shadows:
 * - shadows.none, shadows.xs, shadows.sm, shadows.md
 * - shadows.lg, shadows.xl, shadows['2xl'], shadows.focus
 * 
 * Transitions:
 * - transitions.fast, transitions.normal, transitions.slow
 * - transitions.spring
 */

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * @example
 * // In a component
 * import { useTheme, useColors, useSpacing } from './theme';
 * 
 * function MyComponent() {
 *   const { mode, setThemeMode } = useTheme();
 *   const colors = useColors();
 *   const padding = useSpacing(4);
 *   
 *   return (
 *     <div style={{ 
 *       backgroundColor: colors.background.primary,
 *       color: colors.text.primary,
 *       padding,
 *     }}>
 *       <button onClick={() => setThemeMode('dark')}>
 *         Switch to Dark
 *       </button>
 *     </div>
 *   );
 * }
 * 
 * @example
 * // Theme switcher in settings
 * import { ThemeSwitcher } from './theme';
 * 
 * function SettingsPage() {
 *   return (
 *     <div>
 *       <h2>Appearance</h2>
 *       <ThemeSwitcher variant="full" showLocale={true} />
 *     </div>
 *   );
 * }
 */
