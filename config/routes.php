<?php

/**
 * Dynamic Route Configuration
 * 
 * This file defines the route modules and their configuration.
 * Each module can register its own routes dynamically.
 * 
 * Module Structure:
 * - name: Unique identifier for the module
 * - enabled: Enable/disable the module
 * - routes: Path to the route file
 * - middleware: Default middleware for all routes in the module
 * - prefix: URL prefix for the module
 * - domain: Optional domain for the module (for multi-tenancy)
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Route Modules
    |--------------------------------------------------------------------------
    |
    | Define all route modules here. Each module can be enabled/disabled
    | and configured independently. Modules are loaded in order.
    |
    */
    'modules' => [
        'auth' => [
            'name' => 'Authentication',
            'enabled' => true,
            'routes' => base_path('routes/modules/auth.php'),
            'middleware' => ['web'],
            'prefix' => '',
            'as' => 'auth.',
        ],
        
        'api' => [
            'name' => 'API',
            'enabled' => true,
            'routes' => base_path('routes/modules/api.php'),
            'middleware' => ['api'],
            'prefix' => 'api',
            'as' => 'api.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | API Module Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the API routes. Each resource/endpoint
    | can be configured with specific middleware and options.
    |
    */
    'api_modules' => [
        'tasks' => [
            'name' => 'Tasks',
            'enabled' => true,
            'controller' => \App\Http\Controllers\Api\TaskController::class,
            'middleware' => ['auth:sanctum'],
            'options' => [
                'only' => ['index', 'show', 'store', 'update', 'destroy'],
                'except' => [],
            ],
            // Custom routes that will be registered before the resource
            'custom_routes' => [
                ['method' => 'GET', 'uri' => 'options', 'action' => 'options', 'name' => 'tasks.options'],
                ['method' => 'GET', 'uri' => 'search', 'action' => 'search', 'name' => 'tasks.search'],
                ['method' => 'GET', 'uri' => 'search/quick', 'action' => 'quickSearch', 'name' => 'tasks.quickSearch'],
                ['method' => 'GET', 'uri' => 'search/suggestions', 'action' => 'suggestions', 'name' => 'tasks.suggestions'],
                ['method' => 'GET', 'uri' => 'calendar', 'action' => 'calendar', 'name' => 'tasks.calendar'],
                ['method' => 'PATCH', 'uri' => '{id}/date', 'action' => 'updateDate', 'name' => 'tasks.date'],
            ],
            // Nested resources
            'nested' => [
                'subtasks' => [
                    'controller' => \App\Http\Controllers\Api\SubtaskController::class,
                    'middleware' => ['auth:sanctum'],
                    'only' => ['index', 'store', 'update', 'destroy'],
                    'custom_routes' => [
                        ['method' => 'PATCH', 'uri' => '{subtask}/toggle', 'action' => 'toggleComplete', 'name' => 'subtasks.toggle'],
                    ],
                ],
            ],
        ],

        'tags' => [
            'name' => 'Tags',
            'enabled' => true,
            'controller' => \App\Http\Controllers\Api\TagController::class,
            'middleware' => ['auth:sanctum'],
            'options' => [
                'only' => ['index', 'store', 'destroy'],
                'except' => ['show', 'update'],
            ],
        ],

        'projects' => [
            'name' => 'Projects',
            'enabled' => true,
            'controller' => \App\Http\Controllers\Api\ProjectController::class,
            'middleware' => ['auth:sanctum'],
            'options' => [
                'only' => ['index', 'store', 'destroy'],
                'except' => ['show', 'update'],
            ],
            'custom_routes' => [
                ['method' => 'PATCH', 'uri' => '{project}/favorite', 'action' => 'updateFavorite', 'name' => 'projects.favorite'],
            ],
        ],

        'saved_views' => [
            'name' => 'Saved Views',
            'enabled' => true,
            'controller' => \App\Http\Controllers\Api\SavedViewController::class,
            'middleware' => ['auth:sanctum'],
            'options' => [
                'only' => ['index', 'store', 'update', 'destroy'],
                'except' => ['show'],
            ],
        ],

        'navigation' => [
            'name' => 'Navigation',
            'enabled' => true,
            'controller' => \App\Http\Controllers\Api\NavigationController::class,
            'middleware' => ['auth:sanctum'],
            'options' => [],
            'custom_routes' => [
                ['method' => 'GET', 'uri' => '/', 'action' => 'index', 'name' => 'navigation.index'],
                ['method' => 'GET', 'uri' => '/counts', 'action' => 'counts', 'name' => 'navigation.counts'],
            ],
        ],

        'theme' => [
            'name' => 'Theme',
            'enabled' => true,
            'controller' => \App\Http\Controllers\Api\ThemeController::class,
            'middleware' => ['auth:sanctum'],
            'options' => [
                'only' => ['index', 'update'],
            ],
            'custom_routes' => [
                ['method' => 'PUT', 'uri' => '/mode', 'action' => 'updateMode', 'name' => 'theme.mode'],
                ['method' => 'PUT', 'uri' => '/locale', 'action' => 'updateLocale', 'name' => 'theme.locale'],
                ['method' => 'PUT', 'uri' => '/preferences', 'action' => 'updatePreferences', 'name' => 'theme.preferences'],
                ['method' => 'PUT', 'uri' => '/reset', 'action' => 'reset', 'name' => 'theme.reset'],
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Route Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for route caching. When enabled, routes are compiled
    | and cached for better performance.
    |
    */
    'cache' => [
        'enabled' => env('ROUTE_CACHE_ENABLED', false),
        'key' => 'app_routes',
    ],
];
