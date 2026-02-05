# Calendar Module Documentation

## Overview

The Calendar Module provides a comprehensive calendar view for task management with support for both Gregorian and Jalali (Shamsi) calendars. It includes day, week, and month views with drag-and-drop functionality for task rescheduling.

## Architecture

### Date Handling Strategy

The module follows a **presentation-layer conversion pattern**:

1. **Database Layer**: Stores all dates in standard ISO 8601 UTC format
2. **API Layer**: Remains calendar-agnostic (all dates in ISO format)
3. **Presentation Layer**: Frontend handles all date conversion and formatting based on user preferences

This approach ensures:
- Backend simplicity and calendar-agnosticism
- Consistent data storage
- Flexible user preference support
- No dependencies on external date libraries

### Key Files

```
frontend/src/
├── services/
│   ├── dateService.js          # Pure JS Jalali conversion
│   ├── datePreferenceService.js # Preference management
│   └── calendarService.js      # Calendar API and utilities
├── hooks/
│   └── useDateFormat.js        # Date formatting hook
├── components/
│   ├── ui/
│   │   ├── JalaliCalendar.jsx  # Date picker component
│   │   └── DateDisplay.jsx     # Date display component
│   └── tasks/
│       ├── TaskCalendar.jsx    # Main calendar component
│       ├── CalendarTaskItem.jsx# Task item for calendar
│       ├── CalendarFilters.jsx # Filter component
│       └── TaskModal.jsx       # Task create/edit modal
├── pages/
│   └── Calendar.jsx            # Calendar page
└── locales/
    ├── en.json                 # English translations
    └── fa.json                 # Persian translations
```

## Features

### Views
- **Day View**: Hourly timeline with task positioning
- **Week View**: 7-day column layout with tasks
- **Month View**: Traditional calendar grid

### Core Functionality
1. **Date Range Queries**: Fetch tasks for specific date ranges
2. **Drag & Drop**: Reschedule tasks by dragging
3. **Filtering**: Filter by status, priority, date range
4. **Task CRUD**: Create, view, edit, delete tasks
5. **Shamsi Support**: Full Jalali calendar integration

### Date Format Support

```javascript
// Available formats
const availableFormats = {
  date: 'YYYY/MM/DD',     // Jalali default
  time: 'HH:mm',           // 24-hour default
  calendar: 'jalali',      // or 'gregorian'
  firstDayOfWeek: 6,       // Saturday (Jalali default)
};
```

## API Endpoints

### GET /api/tasks/calendar
Fetch tasks for calendar view.

**Parameters:**
- `start_date`: Start date (ISO format)
- `end_date`: End date (ISO format)
- `status[]`: Array of status values
- `priority[]`: Array of priority values
- `include_completed`: Boolean

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Task title",
      "description": "Description",
      "due_date": "2026-02-05T10:30:00.000Z",
      "status": "pending",
      "priority": "medium",
      "tags": []
    }
  ],
  "meta": {
    "total": 10,
    "page": 1
  }
}
```

### PATCH /api/tasks/{id}/date
Update task due date.

**Request:**
```json
{
  "due_date": "2026-02-10T10:30:00.000Z"
}
```

## Usage

### Basic Calendar Component

```jsx
import TaskCalendar from './components/tasks/TaskCalendar';

function App() {
  return (
    <TaskCalendar
      onTaskClick={(task) => console.log('Clicked:', task)}
      onTaskEdit={(task) => console.log('Edit:', task)}
      onCreateTask={(date) => console.log('Create:', date)}
      defaultView="month"
    />
  );
}
```

### Date Formatting Hook

```jsx
import { useDateFormat } from './hooks/useDateFormat';

function MyComponent() {
  const { formatDate, formatTime, isJalali } = useDateFormat();
  
  const formatted = formatDate(new Date(), 'MMMM D, YYYY');
  const time = formatTime(new Date());
  const isRTL = isJalali;
}
```

### Date Preference Service

```javascript
import datePreferenceService from './services/datePreferenceService';

// Get current preferences
const preferences = await datePreferenceService.getPreferences();

// Update preferences
await datePreferenceService.updatePreferences({
  calendar: 'jalali',
  dateFormat: 'YYYY/MM/DD',
  firstDayOfWeek: 6,
});

// Toggle calendar system
await datePreferenceService.toggleCalendar();
```

## Jalali Date Conversion

### Pure JavaScript Implementation

The module includes a pure JavaScript Jalali calendar implementation without external dependencies:

```javascript
// Convert Gregorian to Jalali
const jalali = toJalali(2026, 2, 5); // { year: 1404, month: 11, day: 16 }

// Convert Jalali to Gregorian
const gregorian = toGregorian(1404, 11, 16); // { year: 2026, month: 2, day: 5 }

// Format Jalali date
formatJalaliDate(1404, 11, 16, 'YYYY/MM/DD'); // "1404/11/16"
```

### Month Names (Jalali)

```javascript
const jalaliMonths = [
  'Farvardin', 'Ordibehesht', 'Khordad',
  'Tir', 'Mordad', 'Shahrivar',
  'Mehr', 'Aban', 'Azar',
  'Dey', 'Bahman', 'Esfand'
];
```

## Styling

### CSS Variables

```css
:root {
  --calendar-primary: #3b82f6;
  --calendar-bg: #ffffff;
  --calendar-border: #e5e7eb;
  --calendar-text: #1f2937;
  --calendar-text-muted: #6b7280;
  --calendar-today-bg: #eff6ff;
}
```

### RTL Support

For Jalali calendar, RTL layout is automatically applied:

```css
.jalali-calendar {
  direction: rtl;
  font-family: 'Vazir', 'Tahoma', sans-serif;
}
```

## Accessibility

### Keyboard Navigation
- Arrow keys: Navigate between days
- Enter/Space: Select or activate task
- Escape: Close modals/dropdowns

### Screen Reader Support
- ARIA labels on calendar cells
- Live region for filter changes
- Task announcements for drag operations

## Performance Considerations

### Caching
- Calendar data cached for 5 minutes
- Cache invalidated on task updates
- Manual cache clear available

### Virtualization
- Month view renders all cells
- Week/day views optimized for visible area
- Lazy loading for large datasets

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Future Enhancements

1. **Resource View**: Group tasks by assignee
2. **Recurring Tasks**: Support for recurring task patterns
3. **Time Zones**: Multi-timezone support
4. **Calendar Sync**: Integration with external calendars
5. **Drag & Drop**: Cross-day and cross-week dragging
