# Task Flow Application

<div align="center">

![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=flat-square&logo=laravel)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)
![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php)
![Node](https://img.shields.io/badge/Node-20+-339933?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-000000?style=flat-square)

A full-stack Task Flow List application built with Laravel (backend) and React (frontend).

</div>

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Backend (Laravel)](#backend-laravel)
  - [Frontend (React)](#frontend-react)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Tasks](#tasks)
  - [Projects](#projects)
  - [Tags](#tags)
  - [Notifications](#notifications)
  - [Themes](#themes)
  - [Saved Views](#saved-views)
  - [Subtasks](#subtasks)
- [Architecture](#architecture)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Features
- **User Authentication** - Secure registration, login, and logout with Laravel Sanctum
- **Task Management** - Full CRUD operations for tasks with prioritization
- **Task Organization** - Categorize tasks with tags and projects
- **Due Dates & Reminders** - Set due dates and receive notifications
- **Search & Filter** - Powerful search and filtering capabilities
- **Pagination** - Efficient data loading for large datasets
- **Completion Tracking** - Mark tasks as completed/incomplete

### Advanced Features
- **Social Authentication** - Login with Google and other providers
- **Theme System** - Light/dark mode with customizable colors
- **Internationalization (i18n)** - Multi-language support
- **Accessibility** - WCAG-compliant accessibility features
- **Saved Views** - Save and share custom task views
- **Subtasks** - Break down tasks into smaller items
- **Notifications** - Email and in-app notifications
- **Job Queue** - Background processing for heavy tasks

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Laravel 11.x | Backend framework |
| Laravel Sanctum | API authentication |
| Laravel Socialite | Social authentication |
| MySQL/PostgreSQL | Primary database |
| SQLite | Optional local database |
| Layered Architecture | Controllers → Services → Repositories |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18+ | UI framework with Vite |
| Tailwind CSS | Utility-first styling |
| React Query | Server state management |
| React Router | Client-side routing |
| Axios | HTTP client |
| Material UI | Component library |
| date-fns | Date manipulation |

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Minimum Version | Recommended Version |
|------|-----------------|---------------------|
| PHP | 8.2 | 8.3+ |
| Composer | 2.0 | Latest |
| Node.js | 20.0 | 22+ |
| npm | 10.0 | Latest |
| MySQL/PostgreSQL | 8.0 | Latest |
| Git | 2.0 | Latest |

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/todolist.git
cd todolist

# 2. Setup backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve

# 3. Setup frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

Visit [http://localhost:8000](http://localhost:8000) for the backend API and [http://localhost:5173](http://localhost:5173) for the frontend.

## Project Structure

```
todolist/
├── app/                           # Laravel application
│   ├── Console/
│   │   └── Commands/               # Artisan commands
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/                # API controllers
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── NotificationController.php
│   │   │   │   ├── ProjectController.php
│   │   │   │   ├── SavedViewController.php
│   │   │   │   ├── SocialAuthController.php
│   │   │   │   ├── SubtaskController.php
│   │   │   │   ├── TagController.php
│   │   │   │   ├── TaskController.php
│   │   │   │   └── ThemeController.php
│   │   │   └── Auth/               # Breeze authentication controllers
│   │   ├── Requests/
│   │   │   ├── Auth/               # Login/Register requests
│   │   │   ├── Task/               # Task validation
│   │   │   └── Tag/                # Tag validation
│   │   ├── Resources/              # API resource transformers
│   │   └── Middleware/
│   ├── Jobs/                       # Queue jobs
│   ├── Mail/                       # Email templates
│   ├── Models/                     # Eloquent models
│   ├── Notifications/              # Notification classes
│   ├── Providers/                 # Service providers
│   ├── Repositories/              # Data access layer
│   ├── Services/                  # Business logic layer
│   └── Traits/                    # Reusable traits
├── bootstrap/                     # Laravel bootstrap files
├── config/                        # Configuration files
├── database/
│   ├── migrations/               # Database migrations
│   └── seeders/                  # Database seeders
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md
│   ├── AUTH_MODULE.md
│   ├── CALENDAR_MODULE.md
│   ├── DATE_HANDLING.md
│   ├── I18N_ARCHITECTURE.md
│   ├── NOTIFICATION_MODULE.md
│   ├── SCHEDULER_QUEUE_MODULE.md
│   ├── SCHEDULER_QUEUE_USAGE.md
│   ├── SEARCH_MODULE.md
│   └── THEME_MANAGER.md
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── domain/
│   │   │   │   └── Task/          # Task-related components
│   │   │   ├── layout/            # Layout components
│   │   │   └── ui/               # Reusable UI components
│   │   ├── services/             # API services
│   │   ├── hooks/                # Custom React hooks
│   │   ├── context/              # React context providers
│   │   ├── pages/                # Page components
│   │   └── utils/                # Utility functions
│   ├── package.json
│   └── vite.config.js
├── routes/
│   └── api.php                   # API routes
└── storage/                      # Logs and cache
```

## Setup Instructions

### Backend (Laravel)

```bash
# Navigate to project directory
cd e:/projects/laravel/todo

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations (default: SQLite)
php artisan migrate

# (Optional) Seed the database
php artisan db:seed

# Start development server
php artisan serve
```

The API will be available at `http://localhost:8000`

### Frontend (React)

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Environment Variables

### Backend (.env)

```env
# Application
APP_NAME="Task Flow"
APP_ENV=local
APP_KEY=your_app_key_here
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (SQLite - default)
DB_CONNECTION=sqlite
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=todolist
# DB_USERNAME=root
# DB_PASSWORD=

# Cache & Queue
CACHE_DRIVER=file
QUEUE_CONNECTION=sync

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173

# CORS
CORS_ALLOW_ORIGINS=http://localhost:5173,http://localhost:3000

# Session
SESSION_DOMAIN=localhost

# Socialite (Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Mail (optional)
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=no-reply@example.com
MAIL_FROM_NAME="${APP_NAME}"

# Redis (optional)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### Frontend (.env)

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=todo_flow
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/user` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/google/redirect` | Google OAuth redirect |
| GET | `/api/auth/google/callback` | Google OAuth callback |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks (supports pagination, search, filters) |
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks/{id}` | Get a single task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |
| PATCH | `/api/tasks/{id}/complete` | Mark task as completed |
| PATCH | `/api/tasks/{id}/incomplete` | Mark task as incomplete |
| GET | `/api/tasks/search` | Search tasks |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a new project |
| GET | `/api/projects/{id}` | Get a project |
| PUT | `/api/projects/{id}` | Update a project |
| DELETE | `/api/projects/{id}` | Delete a project |

### Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tags` | List all tags |
| POST | `/api/tags` | Create a new tag |
| GET | `/api/tags/{id}` | Get a tag |
| PUT | `/api/tags/{id}` | Update a tag |
| DELETE | `/api/tags/{id}` | Delete a tag |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List user notifications |
| POST | `/api/notifications` | Create a notification |
| PATCH | `/api/notifications/{id}/read` | Mark as read |
| DELETE | `/api/notifications/{id}` | Delete notification |
| GET | `/api/notifications/settings` | Get notification settings |
| PUT | `/api/notifications/settings` | Update notification settings |

### Themes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/themes` | Get available themes |
| PUT | `/api/themes/current` | Update current theme |
| GET | `/api/themes/accessibility` | Get accessibility settings |
| PUT | `/api/themes/accessibility` | Update accessibility settings |

### Saved Views

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/saved-views` | List saved views |
| POST | `/api/saved-views` | Create saved view |
| GET | `/api/saved-views/{id}` | Get saved view |
| PUT | `/api/saved-views/{id}` | Update saved view |
| DELETE | `/api/saved-views/{id}` | Delete saved view |

### Subtasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subtasks?task_id={id}` | Get subtasks for a task |
| POST | `/api/subtasks` | Create subtask |
| PUT | `/api/subtasks/{id}` | Update subtask |
| DELETE | `/api/subtasks/{id}` | Delete subtask |
| PATCH | `/api/subtasks/{id}/complete` | Mark subtask complete |

## Architecture

This application follows a **layered architecture** pattern:

```
Request → Controller → Service → Repository → Model → Database
          ↓
       Resource → Response
```

### Key Design Patterns

- **Repository Pattern** - Abstracts database operations
- **Service Layer** - Contains business logic
- **Resource Transforms** - API response formatting
- **Form Requests** - Request validation
- **Jobs/Queues** - Background processing
- **Events/Listeners** - Decoupled notifications

### API Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "meta": {
    "pagination": {}
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error"]
  }
}
```

## Testing

### Backend Tests

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test suite
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature
```

### Frontend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Test Categories

- **Unit Tests** - Test individual components/classes
- **Feature Tests** - Test API endpoints and workflows
- **Integration Tests** - Test database interactions
- **E2E Tests** - Test complete user flows

## Deployment

### Production Setup

```bash
# Backend
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

# Frontend
cd frontend
npm install
npm run build
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build images separately
docker build -t todolist-backend ./backend
docker build -t todolist-frontend ./frontend
```

### Environment Checklist

- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Configure production database
- [ ] Set up Redis for caching/queues
- [ ] Configure HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Recommended Production Stack

- **Server**: Nginx/Apache
- **Database**: MySQL/PostgreSQL
- **Cache**: Redis
- **Queue**: Redis/Database
- **Process Manager**: Supervisor/PM2

## Documentation

Detailed documentation for specific modules is available in the [`docs/`](docs/) directory:

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Overall system architecture |
| [AUTH_MODULE.md](docs/AUTH_MODULE.md) | Authentication module details |
| [CALENDAR_MODULE.md](docs/CALENDAR_MODULE.md) | Calendar features |
| [DATE_HANDLING.md](docs/DATE_HANDLING.md) | Date/time handling |
| [I18N_ARCHITECTURE.md](docs/I18N_ARCHITECTURE.md) | Internationalization |
| [NOTIFICATION_MODULE.md](docs/NOTIFICATION_MODULE.md) | Notification system |
| [SCHEDULER_QUEUE_MODULE.md](docs/SCHEDULER_QUEUE_MODULE.md) | Queue architecture |
| [SCHEDULER_QUEUE_USAGE.md](docs/SCHEDULER_QUEUE_USAGE.md) | Queue usage guide |
| [SEARCH_MODULE.md](docs/SEARCH_MODULE.md) | Search functionality |
| [THEME_MANAGER.md](docs/THEME_MANAGER.md) | Theme system |

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **PHP**: Follow PSR-12 coding standard (Laravel Pint)
- **JavaScript**: Follow ESLint config (Airbnb)
- **Commits**: Conventional Commits format
- **Tests**: Maintain or increase coverage

### Pull Request Guidelines

- Must pass all CI checks
- Must include tests for new features
- Must update documentation for API changes
- Should follow existing code style

## Security

If you discover a security vulnerability, please email security@example.com instead of opening a public issue.

### Security Best Practices

- Use HTTPS in production
- Keep dependencies updated
- Implement rate limiting
- Validate all inputs
- Use parameterized queries
- Enable CORS restrictions

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/todolist/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/todolist/discussions)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">


</div>
