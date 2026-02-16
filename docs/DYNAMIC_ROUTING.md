# Dynamic Routing Architecture

## Overview

This document describes the dynamic routing architecture implemented for the Laravel + React application. The system replaces hardcoded routes with a scalable, configurable routing system.

---

## Backend (Laravel) Architecture

### File Structure

```
app/
├── Providers/
│   └── RouteServiceProvider.php      # Main route service provider
├── Routing/
│   ├── RouteRegistrar.php             # Trait for dynamic route registration
│   └── ModuleLoader.php               # Module auto-discovery and loading
config/
└── routes.php                         # Central route configuration
routes/
├── api.php                            # API entry point (refactored)
├── web.php                            # Web entry point
├── auth.php                           # Auth routes
└── modules/                           # Modular route files (optional)
    └── auth.php                       # Auth module routes
```

### Key Components

#### 1. Route Configuration (`config/routes.php`)

Central configuration file that defines:
- Route modules and their settings
- API resource configuration
- Middleware assignments
- Route caching options

```php
// Example: Registering a new API resource dynamically
'tasks' => [
    'name' => 'Tasks',
    'enabled' => true,
    'controller' => \App\Http\Controllers\Api\TaskController::class,
    'middleware' => ['auth:sanctum'],
    'custom_routes' => [
        ['method' => 'GET', 'uri' => 'search', 'action' => 'search'],
    ],
],
```

#### 2. RouteRegistrar Trait (`app/Routing/RouteRegistrar.php`)

Provides methods for dynamically registering routes:
- `registerFromConfig()` - Register routes from configuration array
- `registerApiResource()` - Register API resource routes dynamically
- `registerNestedResource()` - Register nested resource routes
- `registerRoutesFromDirectory()` - Auto-discover routes from directory

#### 3. RouteServiceProvider (`app/Providers/RouteServiceProvider.php`)

Main service provider that:
- Loads route configuration
- Registers API and web routes dynamically
- Provides route caching support
- Integrates with Laravel's middleware system

#### 4. Module Loader (`app/Routing/ModuleLoader.php`)

Enables modular route registration:
- Auto-discovers modules from a directory
- Allows each module to define its own routes
- Supports enabling/disabling modules via configuration

### Adding a New API Resource

To add a new API resource (e.g., "comments"):

1. **Create the controller**:
```bash
php artisan make:controller Api/CommentController
```

2. **Add configuration** in `config/routes.php`:
```php
'comments' => [
    'name' => 'Comments',
    'enabled' => true,
    'controller' => \App\Http\Controllers\Api\CommentController::class,
    'middleware' => ['auth:sanctum'],
    'options' => ['only' => ['index', 'store', 'destroy']],
],
```

3. **Done!** Routes are automatically registered:
   - `GET /api/comments` → `CommentController@index`
   - `POST /api/comments` → `CommentController@store`
   - `DELETE /api/comments/{comment}` → `CommentController@destroy`

### Features

- ✅ Route groups with middleware
- ✅ Named routes
- ✅ Controller separation
- ✅ Modular route registration
- ✅ Laravel route caching support (`php artisan route:cache`)
- ✅ RESTful design
- ✅ Nested resource support

---

## Frontend (React) Architecture

### File Structure

```
frontend/src/
├── config/
│   └── routes.js                      # Central route configuration
├── components/
│   └── routing/
│       ├── DynamicRoutes.jsx          # Route generator component
│       └── RouteGuards.jsx           # Protected route components
├── pages/                             # Page components
│   ├── Dashboard.jsx
│   ├── TaskList.jsx
│   └── ...
└── App.jsx                            # Main application component
```

### Key Components

#### 1. Route Configuration (`frontend/src/config/routes.js`)

Central configuration defining all routes:

```javascript
export const routeConfig = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: createLazyRoute(() => import('../pages/Dashboard.jsx')),
    type: 'private',
    meta: {
      title: 'Dashboard',
      icon: 'dashboard'
    }
  },
  // ... more routes
]
```

**Route Types:**
- `public` - Accessible to everyone
- `private` - Requires authentication
- `guest` - Redirects to dashboard if authenticated
- `admin` - Requires admin role

#### 2. Lazy Loading

Routes use dynamic imports for code splitting:

```javascript
const createLazyRoute = (importFn) => {
  const LazyComponent = lazy(importFn)
  return function LazyRouteWrapper(props) {
    return (
      <Suspense fallback={<LoadingPage />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}
```

**Benefits:**
- Reduced initial bundle size
- Components load only when needed
- Better performance on slower connections

#### 3. Route Guards (`frontend/src/components/routing/RouteGuards.jsx`)

Protected route components:

| Guard | Purpose |
|-------|---------|
| `PrivateRoute` | Requires authentication |
| `GuestRoute` | Redirects authenticated users |
| `AdminRoute` | Requires admin role |
| `RoleRoute` | Requires specific roles |
| `PermissionRoute` | Requires specific permissions |

**Usage:**

```javascript
// Private route
<PrivateRoute>
  <Dashboard />
</PrivateRoute>

// Role-based access
<RoleRoute roles={['admin', 'manager']}>
  <AdminPanel />
</RoleRoute>
```

#### 4. Dynamic Routes Generator

Automatically generates React Router routes from configuration:

```javascript
export function DynamicRoutes() {
  return (
    <Routes>
      {routeConfig.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <RouteWrapper route={route}>
              <route.component />
            </RouteWrapper>
          }
        />
      ))}
    </Routes>
  )
}
```

### Adding a New Page

1. **Create the page component** in `frontend/src/pages/`
2. **Add route configuration** in `frontend/src/config/routes.js`:

```javascript
{
  path: '/new-page',
  name: 'new-page',
  component: createLazyRoute(() => import('../pages/NewPage.jsx')),
  type: 'private', // or 'public', 'guest', 'admin'
  meta: {
    title: 'New Page',
    description: 'Description here'
  }
}
```

3. **Done!** The route is automatically:
   - Lazy loaded
   - Protected (if private)
   - Added to navigation (if applicable)

### Utility Functions

```javascript
import { 
  generateUrl,      // Generate URL from route name
  getRouteByName,   // Get route config by name
  getRouteByPath,   // Get route config by path
  getNavigationRoutes, // Get routes for navigation
  getAccessibleRoutes // Filter routes by user access
} from '../config/routes.js'

// Generate URL with params
const url = generateUrl('tasks.show', { id: 123 })
// Result: '/tasks/123'
```

---

## Features Comparison

### Before vs After

| Feature | Before | After |
|---------|--------|-------|
| **Route Definition** | Hardcoded in App.jsx | Centralized config file |
| **Lazy Loading** | None | Automatic via React.lazy |
| **Code Splitting** | Single bundle | Per-route chunks |
| **Auth Protection** | Manual wrapper components | Reusable guards |
| **Role-based Access** | Not supported | Built-in support |
| **Adding New Route** | Modify App.jsx | Add to config only |
| **Laravel Caching** | Manual | Automatic via config |
| **Modular Routes** | Not supported | Module auto-discovery |

---

## Best Practices

### Backend (Laravel)

1. **Use named routes** for easier URL generation:
   ```php
   route('tasks.show', ['id' => 1])
   ```

2. **Keep route files small** - Use the config to organize routes

3. **Enable route caching** in production:
   ```bash
   php artisan route:cache
   ```

4. **Use middleware for cross-cutting concerns** - Authentication, authorization, localization

### Frontend (React)

1. **Use `generateUrl()` for navigation** - Avoid hardcoded paths

2. **Implement role-based access** - Define roles in route meta

3. **Leverage lazy loading** - All page components should use lazy loading

4. **Keep route config organized** - Group routes by feature/type

---

## Performance Considerations

### Backend

- Route caching reduces route registration time
- Modular loading allows disabling unused modules
- Middleware stack is optimized by Laravel

### Frontend

- Lazy loading reduces initial bundle size
- Code splitting ensures faster initial load
- Routes load only when navigated to

---

## Migration Guide

### Backend Migration

1. Review existing routes in `routes/` directory
2. Add configurations to `config/routes.php`
3. Update `RouteServiceProvider` to use new system
4. Test all routes work correctly
5. Enable route caching in production

### Frontend Migration

1. Export all page components
2. Add entries to `config/routes.js`
3. Update `App.jsx` to use `DynamicRoutes`
4. Implement route guards as needed
5. Test authentication and authorization flows
