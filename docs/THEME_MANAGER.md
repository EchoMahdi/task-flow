# Theme Manager Architecture

## Overview

The Central Theme Manager is a robust, extensible theming system designed to control all visual aspects of the TaskFlow application from a single, unified source of truth. It ensures visual consistency, supports light/dark modes, handles RTL/LTR direction switching, and provides comprehensive accessibility support.

## Architecture Principles

### 1. Single Source of Truth
All visual styling values are defined in a central location (`frontend/src/theme/tokens.js`). Components must never manage their own colors or fonts—all styling must come from the Theme Manager.

### 2. Semantic Token Naming
Instead of hardcoded colors like `#1976d2`, the system uses semantic tokens:
- `colors.primary[600]` (main primary color)
- `colors.background.primary` (main page background)
- `colors.text.secondary` (secondary text color)

### 3. Separation of Concerns
- **Tokens**: Define design values (colors, fonts, spacing)
- **ThemeProvider**: Manages state and persistence
- **Hooks**: Provide convenient access to theme values
- **CSS**: Applies styles to the DOM

## Directory Structure

```
frontend/src/theme/
├── tokens.js              # Design tokens (colors, fonts, spacing, etc.)
├── ThemeProvider.jsx      # React Context provider for theme state
├── hooks.js               # Hooks for accessing theme values
├── MUIThemeProvider.jsx   # MUI integration layer
├── theme.css              # CSS custom properties and base styles
├── components/
│   └── ThemeSwitcher.jsx  # Theme switching UI component
└── index.js               # Main export file
```

## Theme Tokens

### Color System

Colors are organized by semantic categories with a full shade scale (50-900):

```javascript
// Brand colors
colors.primary      // Main application color (blue)
colors.secondary    // Secondary color (zinc)
colors.success      // Success states (green)
colors.warning      // Warning states (amber)
colors.error        // Error states (red)
colors.info         // Info states (cyan)

// Background colors
colors.background.primary    // Main page background
colors.background.secondary  // Surface backgrounds (cards, modals)
colors.background.tertiary   // Subtle backgrounds (hover states)
colors.background.inverse    // Dark backgrounds

// Text colors
colors.text.primary     // Primary text
colors.text.secondary    // Secondary text
colors.text.tertiary    // Muted text
colors.text.disabled    // Disabled text

// Border colors
colors.border.light    // Subtle borders
colors.border.default  // Default borders
colors.border.strong   // Strong borders
```

### Font System

Font configuration is locale-aware:

```javascript
fonts.en.primary  // Inter/Roboto for English
fonts.en.mono     // JetBrains Mono for code
fonts.fa.primary  // Vazir for Persian
fonts.fa.mono     // Monospace for Persian
```

Font switching happens automatically based on locale:
- English (`en`) → Inter, Roboto
- Persian (`fa`) → Vazir, Vazirmatn

### Spacing Scale

Uses an 8px grid base:

```javascript
spacing[0]  // 0
spacing[1]  // 0.25rem (4px)
spacing[2]  // 0.5rem (8px)
spacing[4]  // 1rem (16px)
spacing[8]  // 2rem (32px)
// ... up to spacing[24] (6rem)
```

### Border Radius

```javascript
borderRadius.none    // 0
borderRadius.sm      // 0.25rem (4px)
borderRadius.default // 0.5rem (8px)
borderRadius.md      // 0.75rem (12px)
borderRadius.lg      // 1rem (16px)
borderRadius.xl      // 1.5rem (24px)
borderRadius.full    // 9999px (circle/pill)
```

## Theme Modes

### Supported Modes
- **Light**: Light background, dark text
- **Dark**: Dark background, light text
- **System**: Follows OS preference (auto-detects)

### Theme Switching

```javascript
import { useThemeMode } from './theme';

function ThemeToggle() {
  const { mode, resolvedMode, setThemeMode, toggleThemeMode } = useThemeMode();
  
  return (
    <button onClick={toggleThemeMode}>
      Current: {resolvedMode}
    </button>
  );
}
```

## Locale & Direction

### RTL/LTR Support

The theme manager automatically handles right-to-left layouts for Persian:

```javascript
import { useDirection } from './theme';

function MyComponent() {
  const { locale, setAppLocale, direction, isRTL } = useDirection();
  
  // locale changes automatically update:
  // - font family (Vazir for fa)
  // - text direction (rtl for fa)
  // - text alignment
  // - CSS transformations for mirrored icons
}
```

## Persistence

### Dual Storage Strategy

1. **Local Storage** (Immediate):
   - `app_theme_mode` - Current theme mode
   - `app_locale` - Current locale
   - `app_theme_preferences` - Accessibility preferences

2. **Database** (API sync):
   - Persists across devices
   - Syncs when user logs in
   - Can be managed from admin panel

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/theme` | Get theme settings |
| PUT | `/api/user/theme` | Update all settings |
| PUT | `/api/user/theme/mode` | Update theme mode only |
| PUT | `/api/user/theme/locale` | Update locale only |
| PUT | `/api/user/theme/preferences` | Update accessibility settings |
| PUT | `/api/user/theme/reset` | Reset to defaults |

## Accessibility

### Reduced Motion

```javascript
import { useAccessibility } from './theme';

function MyComponent() {
  const { reducedMotion, setReducedMotion } = useAccessibility();
  
  // Automatically applied via CSS
  // Animations are disabled when reducedMotion is true
}
```

### Focus Rings

Centralized focus styling ensures visibility:

```javascript
import { useFocusRing } from './theme';

function AccessibleButton() {
  const focusRing = useFocusRing();
  
  return <button style={focusRing}>Click me</button>;
}
```

### Font Scale

Users can adjust font size (0.8x to 1.5x):

```javascript
// Font scale affects document root font-size
// All rem-based styles scale proportionally
```

## Component Usage

### Using Theme Values

```javascript
import { useColors, useSpacing, useFontFamily } from './theme';

function Card() {
  const colors = useColors();
  const padding = useSpacing(4);
  const font = useFontFamily('primary');
  
  return (
    <div style={{
      backgroundColor: colors.background.secondary,
      padding,
      fontFamily: font,
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      {children}
    </div>
  );
}
```

### Using Styled Utilities

```javascript
import { createTextStyles, createButtonStyles, createCardStyles } from './theme';

function StyledComponent() {
  const headingStyle = createTextStyles({
    size: 'xl',
    weight: 'bold',
    color: 'primary'
  });
  
  const buttonStyle = createButtonStyles({
    variant: 'primary',
    size: 'md'
  });
  
  const cardStyle = createCardStyles({
    elevated: true,
    interactive: true
  });
  
  return (
    <div style={cardStyle}>
      <h1 style={headingStyle}>Title</h1>
      <button style={buttonStyle}>Action</button>
    </div>
  );
}
```

### Theme Switcher Component

```javascript
import { ThemeSwitcher } from './theme';

// Dropdown variant (default)
<ThemeSwitcher variant="dropdown" showLocale={true} />

// Toggle variant (compact)
<ThemeSwitcher variant="toggle" />

// Buttons variant
<ThemeSwitcher variant="buttons" />

// Full settings panel
<ThemeSwitcher variant="full" showLocale={true} showPreferences={true} />
```

## MUI Integration

The MUI ThemeProvider syncs with the central theme:

```javascript
// Already configured in main.jsx
<CentralThemeProvider>
  <MUIThemeProvider>
    {/* All MUI components use centralized tokens */}
    <Button color="primary">Styled Button</Button>
  </MUIThemeProvider>
</CentralThemeProvider>
```

### MUI Theme Customization

All MUI components are styled using centralized tokens:

```javascript
// MUI components automatically use:
- colors.palette.primary.main
- colors.palette.background.default
- colors.typography.fontFamily
- spacing unit
- borderRadius
- shadows
```

## Extending the Theme

### Adding New Colors

1. Add to `tokens.js`:
```javascript
export const colorsLight = {
  // ... existing colors
  brand: {
    50: '#f0fdf4',
    // ... shades 100-900
    main: '#22c55e',
  },
};
```

2. Components use the new color:
```javascript
const colors = useColors();
<div style={{ color: colors.brand.main }} />
```

### Adding New Themes

1. Create new color palette in `tokens.js`
2. Add theme mode to ThemeProvider
3. Export new theme constants

## Migration Guide

### Updating Existing Components

Before:
```javascript
// BAD: Hardcoded colors
<div style={{ backgroundColor: '#fafafa', color: '#18181b' }}>
```

After:
```javascript
// GOOD: Using theme tokens
import { useColors, useBackgroundColor } from './theme';

function MyComponent() {
  const colors = useColors();
  const bgColor = useBackgroundColor('secondary');
  
  return <div style={{ backgroundColor: bgColor, color: colors.text.primary }} />;
}
```

### Updating MUI Components

MUI components are automatically updated via the theme provider. For custom styles:

```javascript
import { useMUIThemeFromManager } from './theme';

function CustomComponent() {
  const muiTheme = useMUIThemeFromManager();
  
  return (
    <Box sx={{ 
      bgcolor: 'background.paper',
      color: 'text.primary',
      fontSize: muiTheme.typography.fontSize,
    }}>
      Content
    </Box>
  );
}
```

## Verification Checklist

- [x] Theme switching updates entire UI instantly
- [x] Light/Dark mode works consistently across all pages
- [x] Persian language uses Vazir font automatically
- [x] RTL/LTR switches correctly
- [x] No inline styles or hardcoded colors remain
- [x] Theme persists after page reload
- [x] System preference detection works
- [x] Accessibility preferences are respected
- [x] Focus rings are visible and consistent
- [x] Reduced motion animations work correctly
- [x] API persistence syncs across devices

## Production Readiness

The Theme Manager is production-ready with:

- ✅ Comprehensive token system
- ✅ Light/Dark/System modes
- ✅ RTL/LTR support
- ✅ Font switching based on locale
- ✅ Accessibility features
- ✅ API persistence
- ✅ MUI integration
- ✅ No hardcoded colors
- ✅ Extensible architecture
- ✅ CSS custom properties for dynamic theming
