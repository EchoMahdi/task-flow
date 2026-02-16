<?php

/**
 * Module Route Loader
 * 
 * Automatically discovers and loads route modules from the modules directory.
 * This allows new features to register their own routes without modifying
 * the core RouteServiceProvider.
 */

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/**
 * Load all enabled modules from the modules directory
 */
function loadModuleRoutes(string $modulePath, array $middleware = [], string $prefix = '', string $as = ''): void
{
    if (!is_dir($modulePath)) {
        return;
    }

    $modules = glob($modulePath . '/*', GLOB_ONLYDIR);

    foreach ($modules as $moduleDir) {
        $moduleName = basename($moduleDir);
        $moduleConfigPath = $moduleDir . '/routes.php';

        // Check if module has a routes.php config file
        if (file_exists($moduleConfigPath)) {
            $moduleConfig = require $moduleConfigPath;
            
            // Skip disabled modules
            if (isset($moduleConfig['enabled']) && !$moduleConfig['enabled']) {
                continue;
            }

            $moduleMiddleware = array_merge($middleware, $moduleConfig['middleware'] ?? []);
            $modulePrefix = $prefix ? "{$prefix}/" : '';
            $modulePrefix .= $moduleConfig['prefix'] ?? Str::kebab($moduleName);
            $moduleAs = $as . ($moduleConfig['as'] ?? Str::snake($moduleName) . '.');

            Route::prefix($modulePrefix)
                ->middleware($moduleMiddleware)
                ->name($moduleAs)
                ->group(function () use ($moduleDir, $moduleConfig) {
                    // Load routes file if exists
                    $routesFile = $moduleDir . '/Http/Routes.php';
                    if (file_exists($routesFile)) {
                        require $routesFile;
                    }
                    
                    // Also check for routes/web.php or routes/api.php
                    $webRoutes = $moduleDir . '/routes/web.php';
                    if (file_exists($webRoutes)) {
                        require $webRoutes;
                    }
                    
                    $apiRoutes = $moduleDir . '/routes/api.php';
                    if (file_exists($apiRoutes)) {
                        require $apiRoutes;
                    }
                });
        }
    }
}

/**
 * Register a module's routes programmatically
 * 
 * @param string $name Module name
 * @param string $path Module path
 * @param array $config Module configuration
 * @param array $middleware Middleware to apply
 */
function registerModule(string $name, string $path, array $config = [], array $middleware = []): void
{
    $defaultConfig = [
        'enabled' => true,
        'prefix' => Str::kebab($name),
        'as' => Str::snake($name) . '.',
        'middleware' => [],
    ];

    $config = array_merge($defaultConfig, $config);
    $config['middleware'] = array_merge($middleware, $config['middleware']);

    if (!$config['enabled']) {
        return;
    }

    Route::prefix($config['prefix'])
        ->middleware($config['middleware'])
        ->name($config['as'])
        ->group(function () use ($path, $config) {
            $routesFile = $path . '/routes.php';
            if (file_exists($routesFile)) {
                require $routesFile;
            }
        });
}
