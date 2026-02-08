# Authentication & User Management Module

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Authentication Flow](#authentication-flow)
5. [User Management](#user-management)
6. [Security Features](#security-features)
7. [Frontend Integration](#frontend-integration)
8. [Extensibility Guide](#extensibility-guide)
9. [API Reference](#api-reference)

---

## Overview

The Authentication & User Management Module provides a complete, secure, and extensible authentication system for Laravel applications. It includes user registration, login, password recovery, profile management, session tracking, and role-based access control.

### Key Features

- **Secure Authentication**: Token-based authentication using Laravel Sanctum
- **User Registration**: Complete registration flow with email verification
- **Password Management**: Secure password reset and change functionality
- **Session Management**: Track and manage user sessions across devices
- **Profile Management**: Comprehensive user profile with preferences
- **Role-Based Access Control**: Flexible RBAC system for permissions
- **Rate Limiting**: Protection against brute force attacks
- **Timezone Support**: Automatic timezone detection and customization
- **Security Notifications**: Email alerts for important account changes

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Module                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Frontend  │◄──►│  API Layer  │◄──►│  Services   │         │
│  │  (React)    │    │Controllers  │    │             │         │
│  └─────────────┘    └─────────────┘    └──────┬──────┘         │
│         │                                       │                │
│         │                                       ▼                │
│  ┌─────────────┐                       ┌─────────────┐         │
│  │  Sanctum    │◄──────────────────────│   Models    │         │
│  │  (Tokens)   │                       │             │         │
│  └─────────────┘                       └──────┬──────┘         │
│         │                                      │                 │
│         │                               ┌──────▼──────┐          │
│         │                               │   Database  │          │
│         │                               │             │          │
│         └──────────────────────────────►│  (MySQL/    │          │
│                                         │  PostgreSQL)│          │
│                                         └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Component Structure

```
app/
├── Models/
│   ├── User.php                 # Main user model
│   ├── UserSession.php          # Session tracking
│   ├── UserProfile.php         # Extended profile data
│   ├── UserPreference.php      # User preferences
│   ├── UserRole.php            # Role-based access
│   └── PasswordResetToken.php  # Password reset tokens
├── Services/
│   └── AuthService.php         # Core authentication logic
├── Http/
│   ├── Controllers/Api/
│   │   └── AuthController.php  # API endpoints
│   └── Resources/
│       ├── UserResource.php
│       ├── AuthResource.php
│       ├── SessionResource.php
│       └── ...
└── Notifications/
    ├── ResetPasswordNotification.php
    ├── VerifyEmailNotification.php
    └── PasswordChangedNotification.php
```

---

## Database Schema

### Users Table

The main users table extends Laravel's default with additional fields:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `name` | string | User's full name |
| `email` | string | Unique email address |
| `password` | string | Hashed password |
| `phone` | string | Optional phone number |
| `avatar` | string | Avatar file path |
| `timezone` | string | User's timezone (default: UTC) |
| `locale` | string | Preferred language |
| `is_active` | boolean | Account active status |
| `email_verified_at` | datetime | Email verification timestamp |
| `remember_token` | string | Remember me token |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Update timestamp |

### User Sessions Table

Tracks all user sessions for security and management:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | Foreign key to users |
| `token` | string | Unique session token |
| `ip_address` | string | Client IP address |
| `user_agent` | text | Browser/device user agent |
| `device_type` | string | Device type (Mobile/Desktop/Tablet) |
| `browser` | string | Browser name |
| `platform` | string | Operating system |
| `is_active` | boolean | Session active status |
| `last_activity` | datetime | Last activity timestamp |
| `expires_at` | datetime | Session expiration |

### User Profiles Table

Extended profile information:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | Foreign key to users |
| `bio` | text | User biography |
| `birth_date` | date | Date of birth |
| `gender` | string | Gender identity |
| `website` | string | Personal website URL |
| `social_links` | json | Social media links |
| `company` | string | Company name |
| `job_title` | string | Job title |
| `address` | string | Street address |
| `city` | string | City |
| `country` | string | Country |
| `postal_code` | string | Postal code |

### User Preferences Table

User-specific settings and preferences:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | Foreign key to users |
| `theme` | string | UI theme (light/dark/system) |
| `language` | string | Interface language |
| `email_notifications` | boolean | Email notification preference |
| `push_notifications` | boolean | Push notification preference |
| `weekly_digest` | boolean | Weekly summary preference |
| `marketing_emails` | boolean | Marketing email preference |
| `two_factor_enabled` | boolean | 2FA status |
| `session_timeout` | integer | Session timeout in minutes |
| `items_per_page` | integer | Pagination default |
| `date_format` | string | Date display format |
| `time_format` | string | Time display format |
| `start_of_week` | integer | First day of week (0=Sunday) |

### Password Reset Tokens Table

Secure password reset token storage:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | Foreign key to users |
| `email` | string | Email address |
| `token` | string | Reset token (HMAC hashed) |
| `expires_at` | datetime | Token expiration |
| `used_at` | datetime | Token usage timestamp |

### User Roles Table

Role-based access control:

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | Foreign key to users |
| `role` | string | Role identifier |
| `permissions` | json | Role permissions |
| `expires_at` | datetime | Role expiration |

---

## Authentication Flow

### Login Process

```
1. User submits email and password
2. Server validates credentials
   - Check rate limiting (5 attempts/minute)
   - Verify user exists and is active
   - Validate password hash
3. On success:
   - Clear rate limit counter
   - Create user session
   - Generate Sanctum token
   - Return auth response
4. On failure:
   - Increment rate limit
   - Return error message
```

### Registration Process

```
1. User submits registration data
2. Server validates:
   - Email uniqueness
   - Password strength
   - Required fields
3. On success:
   - Create user record
   - Create default profile
   - Create default preferences
   - Send verification email
   - Generate auth token
4. Return success with user data
```

### Password Reset Flow

```
1. User requests password reset
2. Server checks rate limiting (3 requests/hour)
3. If email exists:
   - Create reset token (1 hour expiry)
   - Store token in database
   - Send reset email with secure link
4. User clicks reset link
5. User submits new password
6. Server validates:
   - Token validity
   - Token ownership
   - Password requirements
7. On success:
   - Update password
   - Mark token as used
   - Invalidate all sessions
8. Return success
```

### Session Management

```
Login creates:
- Sanctum API token
- Session record with device info
- 30-day expiration

Session tracking:
- IP address logging
- Device/browser detection
- Last activity updates
- Location estimation

Session invalidation:
- Manual logout (current token)
- Logout all devices
- Token expiration
- Session timeout
```

---

## Security Features

### Password Security

- **Hashing**: Uses Laravel's default `bcrypt` with cost factor 10
- **Validation**: Minimum 8 characters, configurable rules
- **History**: Prevents reuse of recent passwords
- **Reset Tokens**: HMAC-SHA256 hashed, one-time use

### Rate Limiting

| Endpoint | Max Attempts | Time Window |
|----------|-------------|-------------|
| Login | 5 | 1 minute |
| Password Reset Request | 3 | 1 hour |
| Registration | 10 | 1 minute |

### Session Security

- **Token Rotation**: New token on each login
- **Device Tracking**: Browser, OS, IP logging
- **Activity Monitoring**: Last activity timestamp
- **Session Timeout**: Configurable (default: 60 minutes inactive)
- **Concurrent Sessions**: Allow multiple, with management

### Email Security

- **Verification Required**: Email must be verified
- **Secure Reset Links**: Signed URLs with expiration
- **No Email Enumeration**: Generic messages for non-existent emails

### Security Headers & Best Practices

All responses include appropriate security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

---

## Frontend Integration

### Authentication Context

```jsx
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Wrap app with provider
<AuthProvider>
    <App />
</AuthProvider>

// Use auth in components
const { user, login, logout, isAuthenticated } = useAuth();
```

### Login Component

```jsx
import LoginForm from './components/auth/LoginForm';

function App() {
    const handleLogin = (userData) => {
        // Redirect to dashboard
        window.location.href = '/dashboard';
    };

    return (
        <LoginForm 
            onSuccess={handleLogin}
            onSwitchToRegister={() => setView('register')}
            onSwitchToForgot={() => setView('forgot')}
        />
    );
}
```

### Protected Routes

```jsx
import { ProtectedRoute } from './components/auth/ProtectedRoute';

<ProtectedRoute 
    path="/dashboard" 
    component={Dashboard}
    requiredPermission="dashboard.view"
/>
```

### API Calls with Authentication

```jsx
const api = {
    async get(endpoint) {
        const response = await fetch(`/api${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    },
};
```

### Session Management UI

```jsx
function SessionManager({ sessions }) {
    return (
        <div className="sessions">
            {sessions.map(session => (
                <SessionCard 
                    key={session.id}
                    session={session}
                    onRevoke={() => revokeSession(session.id)}
                />
            ))}
            <button onClick={logoutAll}>
                Logout All Devices
            </button>
        </div>
    );
}
```

---

## Extensibility Guide

### Adding Custom Roles

```php
// In app/Models/UserRole.php
public const ROLES = [
    // ... existing roles
    'custom_role' => [
        'label' => 'Custom Role',
        'description' => 'Description of custom role',
        'permissions' => [
            'custom.permission',
            'another.permission',
        ],
    ],
];
```

### Adding OAuth Support

```php
// Install Laravel Socialite
composer require laravel/socialite

// Configure providers in config/services.php
'github' => [
    'client_id' => env('GITHUB_CLIENT_ID'),
    'client_secret' => env('GITHUB_CLIENT_SECRET'),
    'redirect' => 'https://example.com/auth/github/callback',
],

// Create OAuth controller
class SocialAuthController extends Controller
{
    public function redirectToProvider($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function handleCallback($provider)
    {
        $socialUser = Socialite::driver($provider)->user();
        // Find or create user
        // Link social account
        // Generate token
    }
}
```

### Adding Two-Factor Authentication

```php
// 1. Add 2FA fields to preferences table
// 2. Install a 2FA package
composer require pragmarx/google2fa-laravel

// 3. Create 2FA service
class TwoFactorAuthService
{
    public function generateSecret(): string
    {
        return Google2FA::generateSecretKey(32);
    }

    public function verifySecret(string $secret, string $code): bool
    {
        return Google2FA::verifyKey($secret, $code);
    }

    public function getQRCodeUrl(User $user, string $secret): string
    {
        return Google2FA::getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );
    }
}
```

### Custom Authentication Providers

```php
// Create custom provider
class CustomUserProvider implements UserProvider
{
    public function retrieveById($identifier) { /* ... */ }
    public function retrieveByToken($identifier, $token) { /* ... */ }
    public function updateRememberToken($user, $token) { /* ... */ }
    public function retrieveByCredentials(array $credentials) { /* ... */ }
    public function validateCredentials($user, array $credentials) { /* ... */ }
}

// Register in AuthServiceProvider
Auth::provider('custom', function ($app, array $config) {
    return new CustomUserProvider($app['hash'], $config['model']);
});
```

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Guest |
| POST | `/api/auth/login` | User login | Guest |
| POST | `/api/auth/logout` | Logout current session | Required |
| POST | `/api/auth/logout-all` | Logout all sessions | Required |
| GET | `/api/auth/me` | Get current user | Required |
| PUT | `/api/auth/profile` | Update profile | Required |
| PUT | `/api/auth/preferences` | Update preferences | Required |
| PUT | `/api/auth/change-password` | Change password | Required |
| GET | `/api/auth/sessions` | List sessions | Required |
| DELETE | `/api/auth/sessions/{id}` | Revoke session | Required |
| POST | `/api/auth/refresh` | Refresh token | Required |
| POST | `/api/auth/forgot-password` | Send reset link | Guest |
| POST | `/api/auth/reset-password` | Reset password | Guest |
| GET | `/api/auth/verify/{id}/{hash}` | Verify email | Guest |
| POST | `/api/auth/resend-verification` | Resend verification | Required |

### Request/Response Examples

#### Login Request
```json
POST /api/auth/login
{
    "email": "user@example.com",
    "password": "securePassword123"
}
```

#### Login Response
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "user@example.com",
            "timezone": "America/New_York",
            "email_verified": true
        },
        "token": "1|abc123...",
        "token_type": "Bearer",
        "expires_at": "2026-02-05T13:36:00+00:00"
    }
}
```

#### Register Request
```json
POST /api/auth/register
{
    "name": "John Doe",
    "email": "user@example.com",
    "password": "securePassword123",
    "password_confirmation": "securePassword123",
    "timezone": "America/New_York"
}
```

#### Update Profile Request
```json
PUT /api/auth/profile
{
    "name": "John Doe",
    "timezone": "America/New_York",
    "profile": {
        "bio": "Full-stack developer",
        "website": "https://johndoe.com",
        "company": "Acme Corp",
        "job_title": "Senior Developer"
    }
}
```

### Error Responses

All errors follow the same format:

```json
{
    "success": false,
    "message": "Error description",
    "errors": {
        "field": ["Validation error message"]
    }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Server Error

---

## Configuration

### Environment Variables

```env
# Authentication
APP_NAME="Task Manager"
APP_URL="https://example.com"

# Sanctum
SANCTUM_STATEFUL_DOMAINS=example.com
SESSION_DOMAIN=.example.com

# Rate Limiting
AUTH_THROTTLE_REGISTRATION=10
AUTH_THROTTLE_LOGIN=5
AUTH_THROTTLE_RESET=3

# Password Requirements
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBER=true
PASSWORD_REQUIRE_SYMBOL=true
```

### Configuration File

```php
// config/auth.php
return [
    'password_timeout' => 10800, // 3 hours
    'password_history' => 5, // Remember last 5 passwords
    
    'sessions' => [
        'lifetime' => 43200, // 30 days
        'expire_on_close' => false,
    ],
    
    'verification' => [
        'required' => true,
        'expiry' => 60, // minutes
    ],
];
```

---

## Testing

### Feature Tests

```php
// tests/Feature/AuthenticationTest.php
class AuthenticationTest extends TestCase
{
    public function test_user_can_register()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'success',
                'data' => ['user', 'token'],
            ]);
    }

    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => ['user', 'token'],
            ]);
    }

    public function test_unverified_email_cannot_login()
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertUnauthorized();
    }
}
```

### Unit Tests

```php
// tests/Unit/AuthServiceTest.php
class AuthServiceTest extends TestCase
{
    protected AuthService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(AuthService::class);
    }

    public function test_password_change_requires_current_password()
    {
        $user = User::factory()->create();

        $this->expectException(ValidationException::class);
        
        $this->service->changePassword(
            $user,
            'wrongPassword',
            'newPassword123'
        );
    }
}
```

---

## Deployment Checklist

- [ ] Run migrations: `php artisan migrate`
- [ ] Configure Sanctum in `config/sanctum.php`
- [ ] Set up CORS for frontend domain
- [ ] Configure email driver in `.env`
- [ ] Set up queue worker for notifications
- [ ] Configure scheduler for cleanup jobs
- [ ] Set up monitoring for authentication failures
- [ ] Configure rate limiting
- [ ] Test all authentication flows
- [ ] Set up SSL certificate
- [ ] Configure proper session domain

---

## Conclusion

This Authentication & User Management Module provides a robust foundation for secure user authentication and management. Its modular architecture makes it easy to customize and extend while maintaining security best practices.

For support or questions, please refer to the project documentation or create an issue.
