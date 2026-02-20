<?php

use Laravel\Sanctum\Http\Controllers\CsrfCookieController;
use Illuminate\Support\Facades\Route;

Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);
