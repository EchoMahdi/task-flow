<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * LanguageManager Middleware
 *
 * Handles language detection and sets the application locale
 * based on the following priority:
 * 1. Accept-Language header from request
 * 2. User preference from database (if authenticated)
 * 3. Fallback to default locale (en)
 */
class LanguageManager
{
    /**
     * Supported locales
     */
    protected array $supportedLocales = ['en', 'fa'];

    /**
     * Default locale
     */
    protected string $defaultLocale = 'en';

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->detectLocale($request);

        // Set the application locale
        app()->setLocale($locale);

        // Store locale in session for non-API requests
        if (!$request->expectsJson()) {
            $request->session()->put('locale', $locale);
        }

        // Add locale to response headers for debugging
        $response = $next($request);
        $response->headers->set('X-Locale', $locale);

        return $response;
    }

    /**
     * Detect the best matching locale for the request
     */
    protected function detectLocale(Request $request): string
    {
        // 1. Check Accept-Language header
        $acceptLanguage = $request->header('Accept-Language');
        if ($acceptLanguage) {
            $locale = $this->parseAcceptLanguage($acceptLanguage);
            if ($this->isSupportedLocale($locale)) {
                return $locale;
            }
        }

        // 2. Check request parameter (useful for testing)
        $paramLocale = $request->get('lang') ?? $request->get('locale');
        if ($paramLocale && $this->isSupportedLocale($paramLocale)) {
            return $paramLocale;
        }

        // 3. Check session (for non-API requests)
        $sessionLocale = $request->session()->get('locale');
        if ($sessionLocale && $this->isSupportedLocale($sessionLocale)) {
            return $sessionLocale;
        }

        // 4. Check authenticated user's preference
        if ($request->user()) {
            $userPreference = $request->user()->preference;
            if ($userPreference && $userPreference->language) {
                $userLocale = $userPreference->language;
                if ($this->isSupportedLocale($userLocale)) {
                    return $userLocale;
                }
            }
        }

        // 5. Fallback to default locale
        return $this->defaultLocale;
    }

    /**
     * Parse Accept-Language header to get the best matching locale
     */
    protected function parseAcceptLanguage(string $header): ?string
    {
        $languages = explode(',', $header);
        $priorities = [];

        foreach ($languages as $language) {
            $parts = explode(';', $language);
            $locale = trim($parts[0]);
            $quality = 1.0;

            // Parse quality value if present
            if (isset($parts[1])) {
                if (preg_match('/q=(\d*\.?\d+)/', $parts[1], $matches)) {
                    $quality = (float) $matches[1];
                }
            }

            // Extract just the language code (e.g., 'en-US' -> 'en')
            $locale = explode('-', $locale)[0];

            if (!isset($priorities[$quality])) {
                $priorities[$quality] = [];
            }
            $priorities[$quality][] = $locale;
        }

        // Sort by quality (descending)
        krsort($priorities);

        // Return the highest priority supported locale
        foreach ($priorities as $locales) {
            foreach ($locales as $locale) {
                if ($this->isSupportedLocale($locale)) {
                    return $locale;
                }
            }
        }

        return null;
    }

    /**
     * Check if a locale is supported
     */
    protected function isSupportedLocale(?string $locale): bool
    {
        return $locale && in_array($locale, $this->supportedLocales, true);
    }

    /**
     * Get supported locales
     */
    public function getSupportedLocales(): array
    {
        return $this->supportedLocales;
    }

    /**
     * Get default locale
     */
    public function getDefaultLocale(): string
    {
        return $this->defaultLocale;
    }
}
