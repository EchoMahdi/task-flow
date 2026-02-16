<?php

namespace App\Providers;

use App\Routing\RouteRegistrar;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    use RouteRegistrar;

    /**
     * The path to your application's "home" route.
     *
     * @var string
     */
    public const HOME = '/dashboard';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            $this->mapApiRoutes();
            $this->mapWebRoutes();
        });
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip())->response(function () {
                return response()->json(['message' => 'Too many requests. Please try again later.'], 429);
            });
        });
    }

    /**
     * Define the "web" routes for the application.
     *
     * These routes all receive session state, CSRF protection, etc.
     */
    protected function mapWebRoutes(): void
    {
        $config = config('routes');
        
        // Load web modules from config
        if (isset($config['modules'])) {
            $webModules = array_filter($config['modules'] ?? [], function ($module) {
                return isset($module['type']) && $module['type'] === 'web' 
                    || !isset($module['type']); // Default to web if not specified
            });

            foreach ($webModules as $key => $module) {
                if (!($module['enabled'] ?? true)) {
                    continue;
                }

                Route::middleware($module['middleware'] ?? ['web'])
                    ->prefix($module['prefix'] ?? '')
                    ->name($module['as'] ?? '')
                    ->group(function () use ($module) {
                        if (isset($module['routes']) && file_exists($module['routes'])) {
                            require $module['routes'];
                        }
                    });
            }
        }

        // Fallback to traditional web routes file
        Route::middleware('web')
            ->group(base_path('routes/web.php'));
    }

    /**
     * Define the "api" routes for the application.
     *
     * These routes are typically stateless.
     */
    protected function mapApiRoutes(): void
    {
        // Register API modules from config
        $apiModules = config('routes.api_modules', []);
        
        foreach ($apiModules as $name => $config) {
            $this->registerApiResource($name, $config);
        }

        // Load api-auth.php routes
        // Note: The routes file already defines its own middleware (guest for public, auth:sanctum for protected)
        Route::prefix('api')
            ->middleware(['api'])
            ->group(base_path('routes/api-auth.php'));

        // Protected API routes that require authentication
        Route::prefix('api')
            ->middleware(['api', 'auth:sanctum'])
            ->group(base_path('routes/api-notifications.php'));

        Route::prefix('api')
            ->middleware(['api'])
            ->group(base_path('routes/api-social.php'));
    }

    /**
     * Get all enabled route modules
     * 
     * @return array
     */
    public function getEnabledModules(): array
    {
        return array_filter(config('routes.modules', []), function ($module) {
            return $module['enabled'] ?? false;
        });
    }

    /**
     * Get routes for a specific module
     * 
     * @param string $module
     * @return array|null
     */
    public function getModuleRoutes(string $module): ?array
    {
        $modules = config('routes.modules', []);
        return $modules[$module] ?? null;
    }
}
