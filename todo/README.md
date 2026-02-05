# TodoList Application

A full-stack To-Do List application built with Laravel (backend) and React (frontend).

## Features

- User authentication (register, login, logout)
- Task CRUD operations
- Task prioritization (low, medium, high)
- Due dates and reminders
- Task categorization with tags
- Search and filtering
- Pagination
- Mark tasks as completed/incomplete

## Tech Stack

### Backend
- Laravel 11.x
- Laravel Sanctum for API authentication
- MySQL/PostgreSQL database
- Layered architecture (Controllers → Services → Repositories)

### Frontend
- React 18+ with Vite
- Tailwind CSS for styling
- React Query for state management
- React Router for navigation
- Axios for API calls

## Project Structure

```
laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   ├── Requests/
│   │   │   ├── Auth/
│   │   │   ├── Task/
│   │   │   └── Tag/
│   │   └── Resources/
│   ├── Models/
│   ├── Repositories/
│   ├── Services/
│   └── Providers/
├── database/
│   └── migrations/
└── routes/
    └── api.php

frontend/
├── src/
│   ├── components/
│   │   └── tasks/
│   ├── pages/
│   ├── services/
│   ├── context/
│   └── hooks/
├── package.json
└── vite.config.js
```

## Setup Instructions

### Backend (Laravel)

1. Navigate to the project directory:
   ```bash
   cd laravel
   ```

2. Install dependencies:
   ```bash
   composer install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Generate the application key:
   ```bash
   php artisan key:generate
   ```

5. Run database migrations:
   ```bash
   php artisan migrate
   ```

6. Start the development server:
   ```bash
   php artisan serve
   ```

### Frontend (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user

### Tasks
- `GET /api/tasks` - List all tasks (with pagination, search, filters)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/{id}` - Get a task
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task
- `PATCH /api/tasks/{id}/complete` - Mark task as completed
- `PATCH /api/tasks/{id}/incomplete` - Mark task as incomplete

### Tags
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create a new tag
- `GET /api/tags/{id}` - Get a tag
- `PUT /api/tags/{id}` - Update a tag
- `DELETE /api/tags/{id}` - Delete a tag

## Environment Variables

### Backend (.env)
```
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=sqlite
# Or for MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=laravel
# DB_USERNAME=root
# DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173
```

## License

MIT License
