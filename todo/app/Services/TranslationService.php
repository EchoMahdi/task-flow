<?php

namespace App\Services;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Lang;

/**
 * TranslationService
 *
 * Provides centralized translation functions for backend API responses.
 * Uses Laravel's built-in localization system with custom message files.
 */
class TranslationService
{
    /**
     * Default locale
     */
    protected string $defaultLocale = 'en';

    /**
     * Supported locales
     */
    protected array $supportedLocales = ['en', 'fa'];

    /**
     * Get a translated message
     *
     * @param string $key Dot-notation key (e.g., 'auth.login.success')
     * @param array $params Parameters for interpolation
     * @param string|null $locale Override locale (optional)
     * @return string Translated message
     */
    public function get(string $key, array $params = [], ?string $locale = null): string
    {
        $locale = $locale ?? App::getLocale();

        // Ensure locale is supported
        if (!in_array($locale, $this->supportedLocales)) {
            $locale = $this->defaultLocale;
        }

        // Get translation using Laravel's Lang facade
        $message = Lang::get("messages.{$key}", [], $locale);

        // If no translation found, try default locale
        if ($message === "messages.{$key}") {
            $message = Lang::get("messages.{$key}", [], $this->defaultLocale);
        }

        // If still no translation found, use the key as fallback
        if ($message === "messages.{$key}") {
            $message = $this->formatFallback($key, $locale);
        }

        // Interpolate parameters
        if (!empty($params)) {
            $message = $this->interpolate($message, $params);
        }

        return $message;
    }

    /**
     * Get a validation error message
     *
     * @param string $rule Validation rule name
     * @param string $attribute Attribute name
     * @param array $params Additional parameters
     * @return string Translated message
     */
    public function validation(string $rule, string $attribute, array $params = []): string
    {
        $key = "validation.{$rule}";
        $params['attribute'] = $attribute;

        return $this->get($key, $params);
    }

    /**
     * Get an error message
     *
     * @param string $error Error key
     * @param array $params Parameters
     * @return string Translated message
     */
    public function error(string $error, array $params = []): string
    {
        return $this->get("errors.{$error}", $params);
    }

    /**
     * Get a success message
     *
     * @param string $success Success key
     * @param array $params Parameters
     * @return string Translated message
     */
    public function success(string $success, array $params = []): string
    {
        return $this->get("success.{$success}", $params);
    }

    /**
     * Format fallback message when translation not found
     *
     * @param string $key Translation key
     * @param string $locale Current locale
     * @return string Formatted fallback
     */
    protected function formatFallback(string $key, string $locale): string
    {
        // For development, show missing translation
        if (config('app.debug')) {
            return "[Missing: {$key}]";
        }

        // For production, show the key
        return $key;
    }

    /**
     * Interpolate parameters into message
     *
     * @param string $message Message with placeholders
     * @param array $params Parameters to interpolate
     * @return string Interpolated message
     */
    protected function interpolate(string $message, array $params): string
    {
        foreach ($params as $key => $value) {
            $message = str_replace(":{$key}", $value, $message);
        }

        return $message;
    }

    /**
     * Get all supported locales
     *
     * @return array Supported locales
     */
    public function getSupportedLocales(): array
    {
        return $this->supportedLocales;
    }

    /**
     * Get current locale
     *
     * @return string Current locale
     */
    public function getCurrentLocale(): string
    {
        return App::getLocale();
    }

    /**
     * Check if current locale is RTL
     *
     * @return bool True if RTL language
     */
    public function isRTL(): bool
    {
        return in_array(App::getLocale(), ['fa']);
    }

    /**
     * Get locale direction (rtl or ltr)
     *
     * @return string Direction string
     */
    public function getDirection(): string
    {
        return $this->isRTL() ? 'rtl' : 'ltr';
    }

    /**
     * Create a localized API response
     *
     * @param mixed $data Response data
     * @param string|null $message Optional success message key
     * @param int $statusCode HTTP status code
     * @return \Illuminate\Http\JsonResponse
     */
    public function response($data = null, ?string $message = null, int $statusCode = 200)
    {
        $response = [
            'success' => $statusCode >= 200 && $statusCode < 300,
            'data' => $data,
        ];

        if ($message) {
            $response['message'] = $this->get($message);
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Create a localized error response
     *
     * @param string $error Error key
     * @param int $statusCode HTTP status code
     * @param array $params Additional parameters
     * @param mixed $errors Additional error details
     * @return \Illuminate\Http\JsonResponse
     */
    public function errorResponse(string $error, int $statusCode = 400, array $params = [], $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $this->get("errors.{$error}", $params),
            'errors' => $errors,
        ];

        return response()->json($response, $statusCode);
    }

    /**
     * Create a localized validation error response
     *
     * @param \Illuminate\Validation\ValidationException|\Illuminate\Contracts\Validation\Validator|array $validator Validator instance, ValidationException, or array of errors
     * @return \Illuminate\Http\JsonResponse
     */
    public function validationErrorResponse($validator)
    {
        // Handle ValidationException object
        if ($validator instanceof \Illuminate\Validation\ValidationException) {
            $errors = $validator->errors();
        }
        // Handle Validator instance
        elseif (is_object($validator) && method_exists($validator, 'errors')) {
            $errors = $validator->errors()->getMessages();
        }
        // Handle array of errors
        elseif (is_array($validator)) {
            $errors = $validator;
        }
        else {
            $errors = [];
        }

        // Transform errors to use translated messages
        $localizedErrors = [];
        foreach ($errors as $field => $messages) {
            $localizedErrors[$field] = array_map(function ($message) {
                // Extract rule and attribute from message
                if (preg_match('/The (.*?) (.*)\./', $message, $matches)) {
                    $attribute = $matches[1];
                    $rule = $matches[2];
                    return $this->validation($rule, $attribute);
                }
                return $message;
            }, (array) $messages);
        }

        return $this->errorResponse('validation_failed', 422, [], $localizedErrors);
    }
}
