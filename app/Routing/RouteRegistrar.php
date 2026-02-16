<?php

namespace App\Routing;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/**
 * Route Registrar Trait
 * 
 * Provides methods for dynamically registering routes based on configuration.
 * This trait can be used by service providers to register routes from modules.
 */
trait RouteRegistrar
{
    /**
     * Register routes from a configuration array
     * 
     * @param array $config Route configuration
     * @param string $prefix Route prefix
     * @param array $middleware Middleware to apply
     * @param string $as Route name prefix
     * @return void
     */
    protected function registerFromConfig(array $config, string $prefix = '', array $middleware = [], string $as = ''): void
    {
        $enabledModules = array_filter($config['modules'] ?? [], function ($module) {
            return $module['enabled'] ?? false;
        });

        foreach ($enabledModules as $key => $module) {
            $modulePrefix = $prefix ? "{$prefix}/" : '';
            $modulePrefix .= $module['prefix'] ?? $key;
            
            $moduleMiddleware = array_merge($middleware, $module['middleware'] ?? []);
            $moduleAs = $as . ($module['as'] ?? $key . '.');

            Route::prefix($modulePrefix)
                ->middleware($moduleMiddleware)
                ->name($moduleAs)
                ->group(function () use ($module) {
                    if (isset($module['routes']) && file_exists($module['routes'])) {
                        require $module['routes'];
                    }
                });
        }
    }

    /**
     * Register API resource routes dynamically
     * 
     * @param string $name Resource name
     * @param array $config Resource configuration
     * @return void
     */
    protected function registerApiResource(string $name, array $config): void
    {
        if (!$config['enabled'] ?? true) {
            return;
        }

        $controller = $config['controller'];
        $middleware = $config['middleware'] ?? ['auth:sanctum'];
        $options = $config['options'] ?? [];
        $customRoutes = $config['custom_routes'] ?? [];
        $nested = $config['nested'] ?? [];

        // Register custom routes first (before resource)
        if (!empty($customRoutes)) {
            Route::middleware($middleware)->group(function () use ($name, $customRoutes, $controller) {
                foreach ($customRoutes as $route) {
                    $method = strtolower($route['method']);
                    $uri = $route['uri'];
                    $action = $route['action'];
                    $routeName = $route['name'] ?? "{$name}.{$action}";

                    Route::$method($uri, [$controller, $action])->name($routeName);
                }
            });
        }

        // Register API resource
        $resourceOptions = [];
        if (!empty($options['only'])) {
            $resourceOptions['only'] = $options['only'];
        } elseif (!empty($options['except'])) {
            $resourceOptions['except'] = $options['except'];
        }

        if (!empty($resourceOptions)) {
            Route::resource($name, $controller)->middleware($middleware)->names($resourceOptions['names'] ?? [])->parameters($resourceOptions['parameters'] ?? []);
        } else {
            Route::apiResource($name, $controller)->middleware($middleware);
        }

        // Register nested resources
        foreach ($nested as $nestedName => $nestedConfig) {
            $this->registerNestedResource($name, $nestedName, $nestedConfig);
        }
    }

    /**
     * Register nested resource routes
     * 
     * @param string $parent Parent resource name
     * @param string $child Child resource name
     * @param array $config Child resource configuration
     * @return void
     */
    protected function registerNestedResource(string $parent, string $child, array $config): void
    {
        $controller = $config['controller'];
        $middleware = $config['middleware'] ?? ['auth:sanctum'];
        $options = $config['options'] ?? [];
        $customRoutes = $config['custom_routes'] ?? [];

        // Register custom routes for nested resource
        if (!empty($customRoutes)) {
            Route::prefix("{$parent}/{{$parent}}")->middleware($middleware)->group(function () use ($child, $customRoutes, $controller) {
                foreach ($customRoutes as $route) {
                    $method = strtolower($route['method']);
                    $uri = $route['uri'];
                    $action = $route['action'];
                    $routeName = $route['name'] ?? "{$child}.{$action}";

                    Route::$method($uri, [$controller, $action])->name($routeName);
                }
            });
        }

        // Register nested resource
        $resourceOptions = [];
        if (!empty($options['only'])) {
            $resourceOptions['only'] = $options['only'];
        } elseif (!empty($options['except'])) {
            $resourceOptions['except'] = $options['except'];
        }

        if (!empty($resourceOptions)) {
            Route::resource("{$parent}.{$child}", $controller)
                ->middleware($middleware)
                ->names($resourceOptions['names'] ?? []);
        } else {
            Route::resource("{$parent}.{$child}", $controller)
                ->middleware($middleware)
                ->only($options['only'] ?? ['index', 'store', 'update', 'destroy']);
        }
    }

    /**
     * Register routes from a directory automatically
     * 
     * @param string $directory Directory containing route files
     * @param array $middleware Default middleware
     * @return void
     */
    protected function registerRoutesFromDirectory(string $directory, array $middleware = []): void
    {
        if (!is_dir($directory)) {
            return;
        }

        $files = glob($directory . '/*.php');
        
        foreach ($files as $file) {
            $basename = basename($file, '.php');
            
            // Skip files that start with underscore
            if (Str::startsWith($basename, '_')) {
                continue;
            }

            Route::middleware($middleware)->group(function () use ($file) {
                require $file;
            });
        }
    }

    /**
     * Get route configuration for caching
     * 
     * @return array
     */
    public function getRouteConfig(): array
    {
        return config('routes', []);
    }

    /**
     * Check if route caching is enabled
     * 
     * @return bool
     */
    protected function isRouteCachingEnabled(): bool
    {
        return config('routes.cache.enabled', false) && app()->environment('production');
    }
}
