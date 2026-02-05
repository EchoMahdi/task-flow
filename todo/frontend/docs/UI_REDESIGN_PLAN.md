# UI/UX Redesign Plan

## Overview

Redesigning the Todo application with a calm, professional, and maintainable architecture focused on task-first experience with minimal cognitive load.

---

## 1. Layout Architecture

### Current State
- Single layout file (`layout/index.jsx`) with ~850 lines
- Header + Main content structure
- No clear zone separation

### Proposed Structure: 3-Zone Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Header / Top Bar                             │
│                    (Search, Notifications, User)                    │
├───────────────┬─────────────────────────────────────────┬───────────┤
│               │                                         │           │
│  Navigation   │           Main Workspace                │  Context  │
│    Rail       │                                         │   Panel   │
│               │                                         │           Projects   │    │
│  - Task List / Board / Calendar        │  - Task   │
│  - Filters    │                                         │    Detail │
│  - Saved      │    ┌─────────────────────────────────┐  │  - Quick  │
│    Views      │    │    Quick Add Bar                │  │    Edit   │
│  - Tags       │    ├─────────────────────────────────┤  │  - Meta   │
│  - Smart      │    │    Task Item 1                  │  │  - Activity│
│    Lists      │    ├─────────────────────────────────┤  │           │
│               │    │    Task Item 2                  │  │           │
│               │    ├─────────────────────────────────┤  │           │
│               │    │    Task Item 3                  │  │           │
│               │    ├─────────────────────────────────┤  │           │
│               │    │    Filter Chips                 │  │           │
│               │    └─────────────────────────────────┘  │           │
│               │                                         │           │
└───────────────┴─────────────────────────────────────────┴───────────┘
```

### Grid System
```css
.app-shell {
  display: grid;
  grid-template-columns: nav-rail-width 1fr context-panel-width;
  grid-template-rows: header-height 1fr;
  height: 100vh;
  overflow: hidden;
}

.nav-rail {
  grid-row: 1 / -1;
  width: var(--nav-rail-width);
  transition: width var(--transition-fast);
}

.nav-rail.collapsed {
  width: var(--nav-rail-collapsed-width);
}

.main-workspace {
  overflow-y: auto;
  padding: var(--space-6);
}

.context-panel {
  width: var(--context-panel-width);
  border-left: 1px solid var(--color-border);
  overflow-y: auto;
}
```

---

## 2. Component Architecture

### Component Layers

```
src/components/
├── primitives/           # Atomic UI components
│   ├── Button/
│   │   ├── index.jsx
│   │   ├── Button.jsx
│   │   └── variants.js  # variant styles
│   ├── Input/
│   │   ├── index.jsx
│   │   ├── TextInput.jsx
│   │   ├── TextArea.jsx
│   │   └── InputBase.jsx
│   ├── Select/
│   │   ├── index.jsx
│   │   └── Select.jsx
│   ├── Toggle/
│   │   ├── index.jsx
│   │   └── Toggle.jsx
│   ├── Card/
│   │   ├── index.jsx
│   │   └── Card.jsx
│   ├── Divider/
│   ├── Badge/
│   ├── Tooltip/
│   ├── Modal/
│   └── Drawer/
│
├── domain/              # Task-specific components
│   ├── Task/
│   │   ├── index.jsx
│   │   ├── TaskRow.jsx
│   │   ├── TaskList.jsx
│   │   ├── TaskCard.jsx
│   │   ├── TaskItem.jsx
│   │   └── TaskCheckbox.jsx
│   ├── ProjectNav/
│   │   ├── index.jsx
│   │   ├── ProjectItem.jsx
│   │   └── ProjectList.jsx
│   ├── FilterPills/
│   │   ├── index.jsx
│   │   ├── FilterChip.jsx
│   │   └── FilterGroup.jsx
│   ├── QuickAddBar/
│   │   ├── index.jsx
│   │   └── QuickAddBar.jsx
│   ├── TaskToolbar/
│   │   ├── index.jsx
│   │   └── ViewToggle.jsx
│   └── TaskDetailPanel/
│       ├── index.jsx
│       ├── TaskDetailHeader.jsx
│       ├── TaskDescription.jsx
│       ├── TaskMetadata.jsx
│       └── TaskActivity.jsx
│
└── layout/              # Structural components
    ├── AppShell/
    │   ├── index.jsx
    │   └── AppShell.jsx
    ├── NavigationRail/
    │   ├── index.jsx
    │   ├── NavRail.jsx
    │   └── NavSection.jsx
    ├── MainWorkspace/
    │   ├── index.jsx
    │   └── Workspace.jsx
    ├── ContextPanel/
    │   ├── index.jsx
    │   └── ContextPane.jsx
    └── Header/
        ├── index.jsx
        └── TopBar.jsx
```

### Primitive Component Template

```jsx
// src/components/primitives/Button/Button.jsx
import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import './Button.css';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizes = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  asChild = false,
  disabled = false,
  loading = false,
  className = '',
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      className={[
        'btn',
        variants[variant],
        sizes[size],
        loading && 'btn-loading',
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {children}
    </Comp>
  );
});

Button.displayName = 'Button';
```

---

## 3. Design Tokens System

### Global Tokens (theme.css)

```css
:root {
  /* Colors - Semantic naming */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-bg-hover: #e2e8f0;
  --color-bg-active: #cbd5e1;
  
  --color-surface-elevated: #ffffff;
  --color-surface-overlay: rgba(255, 255, 255, 0.95);
  --color-surface-modal: rgba(255, 255, 255, 0.98);
  
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #94a3b8;
  --color-text-muted: #64748b;
  --color-text-inverse: #ffffff;
  
  --color-border-light: #e2e8f0;
  --color-border-default: #cbd5e1;
  --color-border-strong: #94a3b8;
  
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  
  --color-success-500: #22c55e;
  --color-success-100: #dcfce7;
  --color-warning-500: #f59e0b;
  --color-warning-100: #fef3c7;
  --color-danger-500: #ef4444;
  --color-danger-100: #fee2e2;
  
  /* Spacing - 4px base */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  
  /* Typography */
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  
  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
  
  /* Layout */
  --nav-rail-width: 260px;
  --nav-rail-collapsed: 72px;
  --context-panel-width: 360px;
  --header-height: 64px;
}
```

### Semantic Tokens (applied classes)

```css
/* Task-specific semantic tokens */
.task-row {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: all var(--transition-fast);
}

.task-row:hover {
  border-color: var(--color-border-default);
  box-shadow: var(--shadow-sm);
}

.task-complete {
  opacity: 0.6;
  text-decoration: line-through;
}

.task-priority-high {
  border-left: 3px solid var(--color-danger-500);
}

.task-priority-medium {
  border-left: 3px solid var(--color-warning-500);
}

.task-priority-low {
  border-left: 3px solid var(--color-success-500);
}

.task-overdue {
  background: var(--color-danger-100);
}

/* Focus states for accessibility */
.focus-ring {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-bg-primary), 0 0 0 4px var(--color-primary-500);
}

/* Filter chips */
.filter-chip {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
}

.filter-chip.active {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}
```

---

## 4. Theme Files

### theme.light.css
```css
[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-border-light: #e2e8f0;
}
```

### theme.dark.css
```css
[data-theme="dark"] {
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-tertiary: #334155;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-border-light: #334155;
  
  --color-surface-elevated: #1e293b;
  --color-surface-overlay: rgba(15, 23, 42, 0.95);
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
}
```

---

## 5. Task Workflow UX

### Quick Add Bar (Top of Workspace)
```jsx
// QuickAddBar component
export const QuickAddBar = ({ onAddTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask({ title: title.trim() });
      setTitle('');
      setIsExpanded(false);
    }
  };

  return (
    <div className="quick-add-bar">
      <button
        className="quick-add-trigger"
        onClick={() => setIsExpanded(true)}
      >
        <Icons.Plus className="w-5 h-5" />
        <span>Add a task...</span>
        <kbd className="quick-add-shortcut">⌘N</kbd>
      </button>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="quick-add-form">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="quick-add-input"
            autoFocus
          />
          <div className="quick-add-actions">
            <Button type="submit" variant="primary" size="sm">
              Add Task
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
```

### Task Row (Inline Editing)
```jsx
// TaskRow component
export const TaskRow = ({ task, onToggle, onEdit, onOpenDetail }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleSave = () => {
    if (title.trim() !== task.title) {
      onEdit({ ...task, title: title.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div
      className={[
        'task-row',
        task.completed && 'task-complete',
        task.priority && `task-priority-${task.priority}`,
        isOverdue(task.dueDate) && 'task-overdue',
      ].filter(Boolean).join(' ')}
    >
      <button
        className="task-checkbox"
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.completed ? (
          <Icons.CheckCircle className="w-5 h-5 text-success-500" />
        ) : (
          <Icons.Circle className="w-5 h-5 text-secondary-400" />
        )}
      </button>

      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="task-title-input"
          autoFocus
        />
      ) : (
        <span
          className="task-title"
          onClick={() => onOpenDetail(task)}
          onDoubleClick={() => setIsEditing(true)}
        >
          {task.title}
        </span>
      )}

      <div className="task-meta">
        {task.dueDate && (
          <span className="task-due-date">
            <Icons.Calendar className="w-4 h-4" />
            {formatDate(task.dueDate)}
          </span>
        )}
        {task.tags?.map((tag) => (
          <Badge key={tag.id} variant="tag">
            {tag.name}
          </Badge>
        ))}
      </div>

      <button
        className="task-more"
        onClick={() => onOpenDetail(task)}
      >
        <Icons.MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
};
```

### Filter Chips
```jsx
// FilterChips component
export const FilterChips = ({ filters, activeFilters, onToggle }) => {
  return (
    <div className="filter-chips">
      <FilterChip
        icon={<Icons.Clock className="w-4 h-4" />}
        label="Overdue"
        count={filters.overdue}
        active={activeFilters.includes('overdue')}
        onClick={() => onToggle('overdue')}
      />
      <FilterChip
        icon={<Icons.Today className="w-4 h-4" />}
        label="Today"
        count={filters.today}
        active={activeFilters.includes('today')}
        onClick={() => onToggle('today')}
      />
      <FilterChip
        icon={<Icons.Calendar className="w-4 h-4" />}
        label="Upcoming"
        count={filters.upcoming}
        active={activeFilters.includes('upcoming')}
        onClick={() => onToggle('upcoming')}
      />
    </div>
  );
};
```

---

## 6. Navigation Rail Structure

```
NavigationRail
├── Top Section (Logo + User)
│   └── AppLogo
│   └── UserAvatar
│
├── Projects
│   ├── ProjectList
│   │   ├── ProjectItem (collapsible)
│   │   │   ├── ProjectIcon
│   │   │   ├── ProjectName
│   │   │   └── TaskCount
│   │   └── AddProjectButton
│   └── Favorites
│
├── Filters
│   ├── Inbox
│   ├── All Tasks
│   ├── Completed
│   └── Custom Filters
│
├── Saved Views
│   └── ViewList (user-created saved filters)
│
└── Tags
    └── TagList (color-coded tags)
```

---

## 7. Context Panel Structure

```
ContextPanel (Right Side - slides in)
├── Task Detail Header
│   ├── BackButton
│   ├── TaskActions (more menu)
│   └── TaskTitle (editable)
│
├── Task Description
│   ├── Expandable text area
│   └── Rich text formatting
│
├── Task Metadata
│   ├── Due Date (date picker)
│   ├── Priority (selector)
│   ├── Labels/Tags (multi-select)
│   ├── Assignee (user picker)
│   └── Project (selector)
│
├── Subtasks
│   ├── SubtaskList
│   └── AddSubtaskInput
│
├── Attachments
│   └── FileList
│
└── Activity/History
    ├── ActivityTimeline
    └── ActivityItem
```

---

## 8. Implementation Phases

### Phase 1: Foundation
- [ ] Create token CSS files (theme.css)
- [ ] Refactor primitive components into dedicated folders
- [ ] Set up CSS variable system
- [ ] Create AppShell layout component

### Phase 2: Navigation Rail
- [ ] Build NavigationRail component
- [ ] Implement collapsible nav
- [ ] Add project navigation
- [ ] Add filter navigation

### Phase 3: Main Workspace
- [ ] Build QuickAddBar
- [ ] Refactor TaskList/TaskRow components
- [ ] Implement filter chips
- [ ] Add view toggle (list/board/calendar)

### Phase 4: Context Panel
- [ ] Build ContextPanel component
- [ ] Create TaskDetailPanel
- [ ] Implement slide-in animation
- [ ] Add inline editing

### Phase 5: Polish
- [ ] Add transitions and animations
- [ ] Implement reduced motion support
- [ ] Final accessibility review
- [ ] Performance optimization

---

## 9. Migration Strategy

### Backward Compatibility
- Keep existing `MainLayout` as wrapper
- Gradually migrate pages to new AppShell
- No breaking changes to API or data structures

### Component Mapping

| Current Component | New Component |
|-------------------|---------------|
| `MainLayout` | `AppShell` |
| `Header` | `TopBar` (inside AppShell) |
| `TaskList` | `TaskList` (refactored) |
| `TaskItem` | `TaskRow` |
| `TaskModal` | `ContextPanel` + `TaskDetailPanel` |

### CSS Migration
```css
/* Old classes mapped to new tokens */
.secondary-100 { background: var(--color-bg-secondary); }
.secondary-200 { background: var(--color-bg-tertiary); }
.text-secondary { color: var(--color-text-secondary); }
```

---

## 10. Benefits of This Architecture

1. **Maintainable**: Clear separation of concerns makes debugging easier
2. **Themeable**: Single CSS variable change affects entire app
3. **Performant**: Lazy loading of context panel
4. **Accessible**: Consistent focus states and keyboard navigation
5. **Responsive**: Grid-based layout adapts naturally
6. **Refactorable**: Each zone can be rewritten independently
7. **Calm UX**: Minimal visual noise, clear hierarchy
