# TaskFlow Application Architecture

## Overview
This is a full-stack To-Do List application built with Laravel (backend) and React (frontend).

## System Architecture

### Backend (Laravel)
- **Framework**: Laravel 11.x
- **API**: RESTful API with Laravel Sanctum for authentication
- **Architecture Pattern**: Layered Architecture (Controllers → Services → Repositories → Models)
- **Database**: MySQL/PostgreSQL
- **Validation**: Form Request Validation

### Frontend (React)
- **Framework**: React 18+ with Vite
- **State Management**: React Query + Context API
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

## Database Schema

### Users Table
- id (primary key)
- name
- email (unique)
- password
- remember_token
- timestamps

### Tasks Table
- id (primary key)
- user_id (foreign key)
- title
- description
- priority (enum: low, medium, high)
- due_date
- is_completed (boolean)
- completed_at
- created_at
- updated_at

### Tags Table
- id (primary key)
- name (unique)
- color
- timestamps

### Task_Tag Table (Pivot)
- task_id (foreign key)
- tag_id (foreign key)

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/user

### Tasks
- GET /api/tasks (with pagination, search, filter)
- POST /api/tasks
- GET /api/tasks/{id}
- PUT /api/tasks/{id}
- DELETE /api/tasks/{id}
- PATCH /api/tasks/{id}/complete
- PATCH /api/tasks/{id}/incomplete

### Tags
- GET /api/tags
- POST /api/tags
- PUT /api/tags/{id}
- DELETE /api/tags/{id}

## Project Structure

```
laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── TaskController.php
│   │   │   │   └── TagController.php
│   │   │   └── Controller.php
│   │   ├── Requests/
│   │   │   ├── Auth/
│   │   │   ├── Task/
│   │   │   └── Tag/
│   │   └── Resources/
│   │       ├── TaskResource.php
│   │       └── TagResource.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Task.php
│   │   └── Tag.php
│   ├── Services/
│   │   ├── TaskService.php
│   │   └── TagService.php
│   ├── Repositories/
│   │   ├── TaskRepository.php
│   │   └── TagRepository.php
│   └── Providers/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
└── config/
```

```
react/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── tasks/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── Tasks.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── taskService.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useTasks.js
│   ├── context/
│   │   └── AuthContext.jsx
│   └── utils/
├── package.json
└── vite.config.js
```

## Technology Stack

### Backend Dependencies
- laravel/framework: ^11.0
- laravel/sanctum: ^4.0
- laravel/tinker: ^2.9
- symfony/yaml: ^7.0

### Frontend Dependencies
- react: ^18.3.0
- react-dom: ^18.3.0
- react-router-dom: ^6.23.0
- axios: ^1.7.0
- @tanstack/react-query: ^5.40.0
- tailwindcss: ^3.4.0
- date-fns: ^3.6.0

## Security Features
- CSRF protection via Sanctum
- API token authentication
- Form request validation
- SQL injection prevention via Eloquent ORM
- XSS protection

## Performance Considerations
- API resource transformation
- Pagination for large datasets
- Eager loading for relationships
- Caching ready (Redis)
