<?php

use Laravel\Sanctum\Http\Controllers\CsrfCookieController;
use Illuminate\Support\Facades\Route;

// Sanctum CSRF Cookie Route
Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);
